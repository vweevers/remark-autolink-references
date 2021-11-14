# remark-autolink-references

**[`remark`](https://github.com/remarkjs/remark) plugin to autolink custom references like [GitHub Pro](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/configuring-autolinks-to-reference-external-resources) does.** Ideal for referencing external issue trackers in changelogs.

[![npm status](http://img.shields.io/npm/v/remark-autolink-references.svg)](https://www.npmjs.org/package/remark-autolink-references)
[![node](https://img.shields.io/node/v/remark-autolink-references.svg)](https://www.npmjs.org/package/remark-autolink-references)
[![Travis build status](https://img.shields.io/travis/com/vweevers/remark-autolink-references.svg)](http://travis-ci.com/vweevers/remark-autolink-references)
[![Markdown Style Guide](https://img.shields.io/badge/md_style-hallmark-brightgreen.svg)](https://www.npmjs.org/package/hallmark)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

With [npm](https://npmjs.org) do:

```
npm install remark-autolink-references
```

## Usage with [`remark`](https://remark.js.org/)

_This package is ESM-only._

```js
import remark from 'remark'
import autolink from 'remark-autolink-references'

remark()
  .use(autolink, {
    prefix: 'JIRA-',
    url: 'https://example.atlassian.net/browse/JIRA-<num>'
  })
  .process('Example (JIRA-4275)', function (err, file) {
    console.log(String(file))
  })
```

Results in:

```md
- Example ([JIRA-4275](https://example.atlassian.net/browse/JIRA-4275))
```

Set `fix` to false to only warn about unlinked references:

```js
remark()
  .use(autolink, {
    prefix: 'JIRA-',
    url: 'https://example.atlassian.net/browse/JIRA-<num>',
    fix: false
  })
```

## Usage with [`hallmark`](https://github.com/vweevers/hallmark)

This plugin is included in `hallmark` >= 3.1.0. It does nothing until configured via `package.json` or `.hallmarkrc`. Say we have the following markdown in a `CHANGELOG.md` with a reference to a Jira ticket:

```md
### Fixed

- Prevent infinite loop (JIRA-4275)
```

Our `package.json` should look like this:

```json
{
  "name": "example",
  "devDependencies": {
    "hallmark": "^3.1.0",
  },
  "hallmark": {
    "autolinkReferences": {
      "prefix": "JIRA-",
      "url": "https://example.atlassian.net/browse/JIRA-<num>"
    }
  }
}
```

Alternatively we can create a `.hallmarkrc` file containing:

<details><summary>Click to expand</summary>

```json
{
  "autolinkReferences": {
    "prefix": "JIRA-",
    "url": "https://example.atlassian.net/browse/JIRA-<num>"
  }
}
```

</details>

Running `npx hallmark fix` then yields:

```md
### Fixed

- Prevent infinite loop ([JIRA-4275](https://example.atlassian.net/browse/JIRA-4275))
```

While `npx hallmark lint` will warn about unlinked references.

## API

### `autolink(options)`

Options:

- `prefix` (string, required): this prefix appended by a number will generate a link
- `url` (string, required): where to link to. Must contain `<num>` for the reference number.
- `fix` (boolean, default true): if false, lint without modifying the markdown. Will warn about unlinked references.

## License

[MIT](LICENSE).

Adapted from [`remark-github`](https://github.com/remarkjs/remark-github) © 2015 Titus Wormer.
