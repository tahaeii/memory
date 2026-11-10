# Architecture

Memory is one Next.js application. The browser side follows
[Feature-Sliced Design](https://feature-sliced.design); the server side is a set of small services over JSON
files. This page says where things live and why.

```
app/         Routes only: pages and API handlers that call into src/ and server/
contracts/   Types and zod schemas shared by the server and the browser
i18n/        Every text a person can read, as JSON, and the functions that read it
server/      Everything that runs on the server only
src/         The interface, in Feature-Sliced layers
scripts/     Sample data generator
docs/        This documentation
```

## The interface: `src/`

Layers import only from layers below them.

| Layer      | Holds                                                         | Example                                 |
| ---------- | ------------------------------------------------------------- | --------------------------------------- |
| `app`      | Providers and the global stylesheet entry                     | `app/providers`                         |
| `pages`    | One composition per route                                     | `pages/gallery`, `pages/admin`          |
| `widgets`  | Self-contained blocks made of features and entities           | `widgets/media-gallery`, `site-header`  |
| `features` | One thing a person does                                       | `features/media-viewer`, `upload-media` |
| `entities` | The things the product is about                               | `entities/media`, `entities/event`      |
| `shared`   | Knows nothing about the product: UI kit, hooks, tokens, utils | `shared/ui`, `shared/lib`               |

Inside a slice, folders separate what code does:

| Folder    | Holds                                                   |
| --------- | ------------------------------------------------------- |
| `ui/`     | Components. They draw and forward events, nothing else. |
| `model/`  | State and behaviour as hooks (`use-upload-queue.ts`).   |
| `api/`    | Calls to our own `/api` routes.                         |
| `lib/`    | Pure functions, with tests next to them (`*.test.ts`).  |
| `config/` | Constants and option lists.                             |

A slice exposes what others may use through its `index.ts`.

**Logic stays out of components.** The viewer is a good example: `use-zoom-pan`, `use-swipe`,
`use-viewer-dialog` and `use-viewer-items` hold the behaviour; `ViewerStage`, `ViewerToolbar`,
`ViewerFilmstrip` and `ViewerDetails` only draw.

## The UI kit: `src/shared/ui`

Every control is drawn by the app, so it looks and moves the same in every browser and follows the theme and
the brand colours: `Select` (ARIA select-only combobox), `DatePicker`, `ColorPicker`, `Modal`,
`ConfirmDialog`, `Popover`, `Switch`, `Notice`, `FloatingBar`, `VideoPlayer`. They share a few hooks from
`shared/lib`: `usePopover`, `useDismiss`, `usePresence` (keeps something mounted while it animates out),
`useIndicator` (one marker that slides between navigation items) and `useAsyncAction`.

## Texts: `i18n/`

No component or API route contains a sentence. Texts live in `i18n/en/*.json`, one file per area (`gallery`,
`viewer`, `admin`, `errors`, `validation`, …), and are read by key:

```ts
import { plural, t } from '@i18n';
import { rich } from '@i18n/rich';

t('gallery.title'); // "Gallery"
t('validation.password.min', { min: 8 }); // "Use at least 8 characters."
plural('common.media.photos', 1204); // "1,204 photos"
rich('admin.signedInAs', { b: (text) => <b>{text}</b> }, { username, role });
```

Keys are checked by TypeScript: a key that does not exist is a compile error. A count-dependent text is an
object with `one` and `other`. A sentence with a marked part keeps the mark in the text (`<b>…</b>`), so it
stays one sentence for a translator. Adding a language means adding a folder next to `en` and choosing the
folder in `i18n/index.ts`. Server log lines are not texts for visitors and stay in the code.

## Forms and validation

A rule is written once, as a zod schema in `contracts/schemas`, and used twice: by the API route
(`parseWith(schema, body)`) and by the form. `useForm` (`shared/lib/form`) holds the values, runs the schema,
and gives each field its message. The submit button is never disabled for missing input: pressing it shows
what is wrong under each field and focuses the first one; a message leaves as soon as the field is fixed.
Messages fold in and out (`FieldError`, `NoticeSlot`) so nothing below them jumps.

## Design tokens: `src/shared/styles`

```
styles/
  tokens/colors.css       surfaces, text, lines, brand and status colours for both themes
  tokens/typography.css   typefaces and the type scale
  tokens/shape.css        corner radii and elevation
  tokens/motion.css       durations and easing curves
  tokens/layout.css       header height, hero height, section spacing (from the screen's height)
  animations.css          keyframes and the animate-* utilities, the theme switch
  patterns.css            backdrops for empty areas
  base.css, utilities.css
```

Components never contain a raw colour, radius or duration. They use the Tailwind names the tokens map to
(`bg-surface`, `text-muted`, `rounded-lg`, `duration-slow`, `ease-out`). Changing a token changes the whole
interface.

### Themes

The theme is the `dark` class on `<html>`, set on the server from a cookie, so there is no flash on load.
Switching uses a view transition that spreads the new theme from the toggle; browsers without view transitions
cross-fade instead, and "reduce motion" switches at once.

### Brand colours

An organisation chooses two colours. `shared/lib/brand-theme` derives every shade from them in OKLCH (hover,
pressed, soft backgrounds, link text) and checks text contrast against WCAG AA. A colour that would vanish
into the page is moved just far enough to be seen: light colours get darker in the light theme, dark ones
lighter in the dark theme, and black or white become ink (dark on light, light on dark). The bundled logo
keeps one colour in both themes. The result is a small stylesheet of token overrides that the root layout puts
in `<head>`. Values are validated as `#rrggbb` on the server before they are stored.

### Motion

Four durations and five curves (`tokens/motion.css`). Colours, shadows and small lifts under the pointer use
the soft curve; things that enter use the decelerating one. Things that open and close pair an "in" with an
"out" animation selected by `data-state`. Photos grow slowly under the pointer (`media-zoom`), pages fade in
on navigation (`app/template.tsx`), and one reduced-motion rule at the end of `animations.css` covers
everything.

### Layout

Heights follow the visitor's screen (`tokens/layout.css`): a hero fills the first screen under the header
(`min-h-hero`), single-block pages such as sign-in are centred in it (`min-h-page`), and the space between
sections grows with the window (`pt-section`). The unit is `svh`, so nothing moves when a phone's browser bars
slide away.

## The server: `server/`

```
server/
  auth/       password hashing, signed session tokens, rate limiting, access rules
  users/      staff accounts
  settings/   signing secret, friends passcode, branding record
  branding/   name, texts, colours, logo
  events/     events and their covers
  media/      detection by content, image resizing (sharp), video conversion (ffmpeg), the library
  setup/      the first-run setup code
  http/       request helpers, same-origin guard, range-aware file responses
  storage/    paths inside the data folder
  lib/        atomic JSON file store, ids, semaphores
```

Each domain has a repository (reads and writes its JSON file) and a service (the rules). What a request may
contain is a zod schema in `contracts/schemas`, shared with the forms. Route handlers in `app/api` are thin:
check who is asking, validate, call a service.

**Storage.** `JsonFile` keeps a document in memory, applies changes one at a time on a copy and writes it with
a rename, so a crash never leaves a half-written file. This is why a single process is required.

**Video.** Uploads are accepted at once and converted by a single-worker queue that survives restarts. The
browser polls the status of items that are still converting.

## Commands

| Command             | Does                                     |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Development server                       |
| `npm run build`     | Production build                         |
| `npm start`         | Production server                        |
| `npm run lint`      | ESLint                                   |
| `npm run typecheck` | TypeScript, no output                    |
| `npm test`          | Unit tests (`node:test`)                 |
| `npm run format`    | Prettier                                 |
| `npm run samples`   | Add generated sample photos (`--remove`) |
