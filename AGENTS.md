# AGENTS.md

Instructions for AI coding agents (Claude Code, Copilot, etc.) working on this repository.

## Project overview

**Property from Backlink** is an Obsidian community plugin. It adds a frontmatter
property to every note that links to the currently open note, using the current
note's name as the value. Typical use case: tagging every note that belongs to a
Map of Content (MOC) / hub note, PARA-style, without doing it by hand.

Core logic lives in two files:
- `src/main.ts` — plugin entry point, command registration, backlink resolution,
  frontmatter mutation.
- `src/settings.ts` — settings tab UI and the persisted settings shape
  (currently a single field: `propertyName`).

## Environment constraints (important)

This project may be built on one machine and tested on another (desktop,
mobile, or a different platform entirely) by syncing the repository directly
into an Obsidian vault's `.obsidian/plugins/property-from-backlink/` folder,
rather than always building and testing on the same device. **Agents must
respect this, not "fix" it**:

- Because of this, **`main.js` is intentionally committed to the repository**,
  unlike the default Obsidian sample plugin template (which gitignores it and
  expects it to be built locally and attached only to GitHub Releases). A
  plain `git pull`/sync of the repo should be enough to get a working plugin
  build into a vault, without requiring Node.js on the testing device. Do not
  reintroduce `main.js` to `.gitignore`, and do not assume `main.js` is a
  build-only artifact — committing it after every source change is part of
  the normal workflow.
- Never assume the build and the test environment are the same machine or the
  same OS. Don't rely on or introduce anything platform-specific
  (desktop-only Node APis, absolute local paths, OS-specific scripts) unless
  it's genuinely required by the Obsidian API itself.
- `data.json` (per-vault plugin settings) must stay gitignored. Never commit it.

## Build & verification commands

Always run both before considering a change complete:

```bash
npm run build   # tsc type-check + esbuild production bundle -> main.js
npm run lint    # eslint, includes eslint-plugin-obsidianmd rules
```

Zero errors and zero warnings from `npm run lint` is the bar — this repo's
lint config includes Obsidian-specific rules (`obsidianmd/...`) that are also
enforced by the official plugin review bot when this plugin is submitted or
updated in the community plugin directory. Treat every rule from this plugin
as a hard requirement, not a style suggestion.

`npm run dev` runs esbuild in watch mode. It does **not** survive a Codespaces
timeout/restart — after any interruption, verify it's still running before
assuming `main.js` is up to date. When in doubt, run `npm run build` once
explicitly rather than trusting a possibly-dead watch process.

## Versioning workflow

Three files must stay in sync on every version bump:
- `manifest.json` → `version`
- `package.json` → `version`
- `versions.json` → new `"x.y.z": "<minAppVersion>"` entry

Tags must exactly match the plugin version with **no `v` prefix**
(e.g. `1.0.0`, not `v1.0.0`) — `.npmrc` (`tag-version-prefix=""`) already
enforces this if using `npm version <patch|minor|major>`. Obsidian and BRAT
both resolve releases by exact string match against `manifest.json`'s
`version`, so any mismatch breaks update detection.

For minor/local testing iterations, it is acceptable and expected to just
commit + push to `main` without bumping version/tag/release — the maintainer
pulls directly into the test vault via Working Copy. Reserve version bumps,
tags, and GitHub Releases for meaningful checkpoints (BRAT-trackable betas,
or the eventual community plugin submission).

## Code conventions

- TypeScript, strict mode. Do not introduce `any` — the lint config
  (`@typescript-eslint/no-unsafe-*` rules) will reject it. When dealing with
  Obsidian APIs that return loosely-typed data (e.g. `loadData()`,
  `processFrontMatter`'s callback parameter), annotate explicitly
  (`Partial<Settings> | null`, `Record<string, unknown>`, etc.) rather than
  suppressing the rule.
- Tabs for indentation, single quotes — see `.editorconfig`, keep it that way.
- All user-facing strings (command names, setting labels/descriptions, notices)
  must be in English and use sentence case (`obsidianmd/ui/sentence-case`
  lint rule) — e.g. "Tag backlinks of this note with property", not
  "Tag Backlinks Of This Note With Property".
- Frontmatter mutation must always go through
  `app.fileManager.processFrontMatter()` — never hand-parse or regex the raw
  file content for YAML frontmatter.
- Any code that iterates `app.metadataCache.resolvedLinks` and resolves paths
  to files must filter for `file instanceof TFile && file.extension === 'md'`
  before treating something as a note. `resolvedLinks` can include non-Markdown
  files (e.g. `.canvas`).
- Preserve idempotency: re-running the tagging command on the same source note
  must never create duplicate values in the target property. This is a
  functional requirement, not just a nice-to-have — cover it when touching
  `tagBacklinks()`.
- Preserve non-destructiveness: existing frontmatter values on a target note
  must never be silently overwritten or dropped. A different existing value
  becomes part of a list; it is never replaced.
- Commands must use `checkCallback` and return `false` when there's no active
  file, so the command simply doesn't appear in the command palette rather
  than appearing and failing. Don't replace this with an always-visible
  command plus an error notice.

## Settings

`propertyName` (default `'moc'`) is the only setting. When editing it,
sanitize input to `[a-zA-Z0-9_-]` only (see the `onChange` handler in
`settings.ts`) — the value becomes a literal YAML frontmatter key, so
characters like `:` must never reach `saveSettings()` unsanitized. If adding
new settings, apply the same sanitize-before-persist principle to anything
that ends up as a frontmatter key or is otherwise YAML-sensitive.

## Things NOT to reintroduce

This repo started from `obsidian-sample-plugin` and was deliberately stripped
down. Do not bring back, even accidentally via a template merge or copy-paste:
- `SampleModal`, `SampleSettingTab`, or any class with "Sample" in the name.
- The `registerInterval` demo call.
- `console.log` calls (`no-console` lint rule — use `Notice` for user-facing
  feedback, nothing for debug-only output).
- A ribbon icon — this plugin is command-only, no ribbon icon is needed for
  its current feature set. Don't add one back without an explicit reason.

## Publication status

This plugin is intended for submission to the official Obsidian community
plugin directory (`obsidianmd/obsidian-releases`, `community-plugins.json`).
Keep `README.md`, `LICENSE` (0BSD), and `manifest.json`/`package.json`
metadata (`name`, `description`, `author`) accurate and in sync with the
actual current behavior of the plugin — these are read by human reviewers,
not just by users.
