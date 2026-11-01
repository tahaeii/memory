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

CI runs the linter, the tests and a production build, which also checks the types.

## Conventions

- **Where code goes** is described in [docs/architecture.md](docs/architecture.md). In short: logic lives in
  hooks and plain functions (`model/`, `lib/`, `api/`), components in `ui/` only draw.
- **No raw colours, radii or durations in components.** Use the tokens in `src/shared/styles/tokens`.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org): one line, imperative, with a
  scope, for example `feat(viewer): open details as a side panel on desktop`.
- **Accessibility is part of done.** Controls work with the keyboard, have a name for screen readers and
  respect "reduce motion".
