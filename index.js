'use strict'

module.exports = function autolinkReferences (options) {
  options = options || {}

  // This prefix appended by a number will generate a link.
  const prefix = options.prefix
  const url = options.url
  const fix = options.fix !== false

  if (!url) throw new Error('Missing `url` property in `options`')
  if (!prefix) throw new Error('Missing `prefix` property in `options`')
  if (!url.includes('<num>')) throw new Error('The url must contain <num> for the reference number')

  const proto = this.Parser.prototype
  const scope = proto.inlineTokenizers
  const methods = proto.inlineMethods
  const unlinked = fix ? null : new Set()

  // Add tokenizer to the Parser
  scope.autolinkReferences = tokenizer

  // Specify order (just before inlineText)
  methods.splice(methods.indexOf('inlineText'), 0, 'autolinkReferences')

  // https://github.com/remarkjs/remark/tree/remark-parse%408.0.3/packages/remark-parse#function-tokenizereat-value-silent
  function tokenizer (eat, value, silent) {
    if (!value.startsWith(prefix)) {
      return
    }

    const start = prefix.length

    let end = start
    let number = ''

    while (end < value.length && decimal(value.charCodeAt(end))) {
      number += value[end++]
    }

    if (end - start === 0) return
    if (silent) return true

    const ref = value.slice(0, end)

    if (!fix) {
      unlinked.add(ref)
      return
    }

    const now = eat.now()
    const exit = this.enterLink()

    const node = eat(ref)({
      type: 'link',
      title: null,
      url: url.replace('<num>', number),
      children: this.tokenizeInline(ref, now)
    })

    exit()
    return node
  }

  // "Locators are required for inline tokenizers. Their role is to keep parsing performant"
  tokenizer.locator = createLocator(prefix)
  tokenizer.notInLink = true

  return function transform (root, file) {
    if (fix) return

    for (const ref of unlinked) {
      // TODO: add position
      file.message(`Reference ${ref} must be a link`, root, 'remark-autolink-references:require-link')
    }
  }
}

function createLocator (prefix) {
  const re = new RegExp('\\b' + escape(prefix), 'g')

  // Find the place where a regex begins.
  return function locator (value, offset) {
    re.lastIndex = offset
    const result = re.exec(value)
    return result ? re.lastIndex - result[0].length : -1
  }
}

function escape (re) {
  // https://github.com/sindresorhus/escape-string-regexp
  // MIT License, Copyright (c) Sindre Sorhus
  return re.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

function decimal (code) {
  return code >= 48 && code <= 57
}
