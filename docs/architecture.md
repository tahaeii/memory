# Architecture

Memory is one Next.js application. The browser side follows
[Feature-Sliced Design](https://feature-sliced.design); the server side is a set of small services over JSON
files. This page says where things live and why.

```
app/         Routes only: pages and API handlers that call into src/ and server/
contracts/   Types shared by the server and the browser (DTOs, limits, defaults)
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
`ConfirmDialog`, `Popover`, `Switch`, `Notice`, `VideoPlayer`. They share a few hooks from `shared/lib`:
`usePopover`, `useDismiss`, `usePresence` (keeps something mounted while it animates out) and
`useAsyncAction`.

## Design tokens: `src/shared/styles`

```
styles/
  tokens/colors.css       surfaces, text, lines, brand and status colours for both themes
  tokens/typography.css   typefaces and the type scale
  tokens/shape.css        corner radii and elevation
  tokens/motion.css       durations and easing curves
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
pressed, soft backgrounds, link text, a lighter fill for the dark theme) and checks text contrast against WCAG
AA. The result is a small stylesheet of token overrides that the root layout puts in `<head>`. Values are
validated as `#rrggbb` on the server before they are stored.

### Motion

Four durations and four curves (`tokens/motion.css`). Things that open and close pair an "in" with an "out"
animation selected by `data-state`. One reduced-motion rule at the end of `animations.css` covers everything.

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

Each domain has a repository (reads and writes its JSON file), a service (the rules) and zod schemas (what a
request may contain). Route handlers in `app/api` are thin: check who is asking, validate, call a service.

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
