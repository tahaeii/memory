# Contributing

Thank you for helping. Small, focused pull requests are the easiest to review.

## Getting started

```bash
npm install
npm run samples   # optional: generated photos to work with
npm run dev       # http://localhost:3000, data in ./data
```

The first start prints a setup code in the terminal; enter it on `/setup`.

## Before you open a pull request

```bash
npm run lint
npm run typecheck
npm test
npm run format
```

A git hook (installed by `npm install`) formats and lints the files you commit. Every editor formats on save
with the same settings: `.editorconfig`, `.vscode`, `.idea/prettier.xml` and `.zed` are part of the
repository.

## Conventions

- **Where code goes** is described in [docs/architecture.md](docs/architecture.md). In short: logic lives in
  hooks and plain functions (`model/`, `lib/`, `api/`), components in `ui/` only draw.
- **No raw colours, radii or durations in components.** Use the tokens in `src/shared/styles/tokens`.
- **No text in components or API routes.** Add it to the matching file in `i18n/en` and read it with
  `t('area.key')`; counts use `plural()`, sentences with a marked part use `rich()`.
- **Validation is a zod schema** in `contracts/schemas`, used by the form (through `useForm`) and by the API.
- **Commits** are one line, imperative, with a type and a scope:
  `feat (viewer): open details as a side panel on desktop`.
- **Accessibility is part of done.** Controls work with the keyboard, have a name for screen readers and
  respect "reduce motion".
