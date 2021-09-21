# Page Configuration

Each markdown files can have **YAML frontmatter**.

## Available keys

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

### tocLevels

- Type: `Array<number>`
- Default: `[2, 3]`

The header levels to show in auto-generated TOC (Table Of Contents). Set this
`[]` to disable to generate TOC.
