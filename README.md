# Property from Backlink

Automatically add a frontmatter property to every note that links to a given note, using that note's name as the value.

This is useful for Zettelkasten/PARA-style vaults where you maintain **Maps of Content (MOCs)** or **hub notes**: instead of manually tagging every note that belongs to a MOC, run one command and let the plugin tag all its backlinks for you.

## What it does

1. Open the note you want to use as the "source" (e.g. a MOC note called `Projects`).
2. Run the command **"Tag backlinks of this note with property"**.
3. The plugin finds every note that links to the currently open note (its backlinks).
4. For each backlinking note, it adds a frontmatter property (default name: `moc`) with the source note's name as the value.

### Behavior on existing values

The plugin never overwrites data, it only adds to it:

- **No existing property** → the property is created with the source note's name as its value.
- **Existing property with the same value already** → nothing changes.
- **Existing property with a different single value** → the property becomes a list containing both the old and the new value.
- **Existing property already a list** → the new value is appended, unless it's already present.

Running the command multiple times on the same note is always safe (idempotent) — it will never create duplicate entries.

## Example

Given a note `Projects.md`, and another note `My Idea.md` that contains a link `[[Projects]]`:

Before running the command, `My Idea.md` might have no frontmatter, or:
```yaml
---
moc: SomeOtherHub
---
```

After running the command on `Projects.md`:
```yaml
---
moc:
  - SomeOtherHub
  - Projects
---
```

## Settings

- **Property name** — the frontmatter property used to store the source note's name. Defaults to `moc`. Change it to `category`, `hub`, or anything that fits your vault's conventions.

## Installation

### From Obsidian (once approved in the Community Plugins directory)

1. Open **Settings → Community plugins**.
2. Make sure "Restricted mode" is off.
3. Click **Browse**, search for "Property from Backlink", and install it.
4. Enable the plugin.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](../../releases).
2. Create a folder named `property-from-backlink` inside your vault's `.obsidian/plugins/` directory.
3. Copy the three files into that folder.
4. Reload Obsidian, then enable the plugin under **Settings → Community plugins**.

## Requirements

Requires Obsidian **v1.4.4** or later (uses the `FileManager.processFrontMatter` API).

## Why this plugin

Maintaining consistent metadata across a growing vault is tedious to do by hand. Property from Backlink automates the repetitive part — tagging every note that links to a hub note — while leaving you full control over the property name and never silently overwriting data you've already added.

## License

0BSD — see [LICENSE](LICENSE).
