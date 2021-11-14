import { findAndReplace } from 'mdast-util-find-and-replace'

export default function autolinkReferences (options) {
  options = options || {}

  // This prefix appended by a number will generate a link.
  const prefix = options.prefix
  const url = options.url
  const fix = options.fix !== false

  if (!url) throw new Error('Missing `url` property in `options`')
  if (!prefix) throw new Error('Missing `prefix` property in `options`')
  if (!url.includes('<num>')) throw new Error('The url must contain <num> for the reference number')

  const re = new RegExp('\\b' + escape(prefix) + '(\\d+)', 'g')

  return function transform (tree, file) {
    findAndReplace(tree, [[re, replace]], {
      ignore: ['link', 'linkReference']
    })

    function replace (ref, number, state) {
      if (state.input.charAt(state.index - 1) === '[') return false
      if (/\w/.test(state.input.charAt(state.index + ref.length))) return false

      if (!fix) {
        // TODO: add position
        file.message(
          `Reference ${ref} must be a link`,
          tree,
          'remark-autolink-references:require-link'
        )
        return false
      }

      return {
        type: 'link',
        title: null,
        url: url.replace('<num>', number),
        children: [{ type: 'text', value: ref }]
      }
    }
  }
}

function escape (re) {
  // https://github.com/sindresorhus/escape-string-regexp
  // MIT License, Copyright (c) Sindre Sorhus
  return re.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}
