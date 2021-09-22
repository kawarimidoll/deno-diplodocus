# Page Configuration

Each markdown files can have configurations in YAML frontmatter.

## Format

```markdown
---
title: First page
---

# Hello World

This is my awesome message.
```

## Available keys

### title

- Type: `string`
- Default: content in first `<h1>` element

Page title.

### prev

- Type: `PageLink`
- Default: `undefined`

The link to the previous page. This is set automatically in
[listPages](docs/config#listPages).

### next

- Type: `PageLink`
- Default: `undefined`

The link to the next page. This is set automatically in
[listPages](docs/config#listPages).

<!-- ### date                -->
<!-- - Type: `string`        -->
<!-- - Default: `undefined`  -->
<!-- ### tag                 -->
<!-- - Type: `Array<string>` -->
<!-- - Default: `undefined`  -->
<!-- ### redirect                             -->
<!-- - Type: { from: `string`, to: `string` } -->
<!-- - Default: `undefined`                   -->

### page specified options

These keys are available to **override**
[the site global configurations](docs/02_site_config.md).

- lang
- description
- favicon
- image
- tocLevels
- removeDefaultStyles
- bottomHead
- bottomBody
