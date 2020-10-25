'use strict'

const test = require('tape')
const remark = require('remark')
const fs = require('fs')
const path = require('path')
const plugin = require('..')

test('fixes', function (t) {
  const options = {
    prefix: 'JIRA-',
    url: 'https://example.com/JIRA-<num>'
  }

  run('00-basic-input', '00-basic-output', options, function (err, { file, actual, expected }) {
    t.ifError(err)
    t.is(actual, expected)
    t.same(file.messages.map(String), [])
    t.end()
  })
})

test('lints', function (t) {
  const options = {
    prefix: 'JIRA-',
    url: 'https://example.com/JIRA-<num>',
    fix: false
  }

  run('00-basic-input', '00-basic-input', options, function (err, { file, actual, expected }) {
    t.ifError(err)
    t.is(actual, expected)
    t.same(file.messages.map(String), [
      `${file.path}:1:1-20:53: Reference JIRA-1 must be a link`,
      `${file.path}:1:1-20:53: Reference JIRA-2 must be a link`,
      `${file.path}:1:1-20:53: Reference JIRA-123 must be a link`,
      `${file.path}:1:1-20:53: Reference JIRA-0 must be a link`
    ])
    t.end()
  })
})

test('does not warn if all references are linked', function (t) {
  const options = {
    prefix: 'JIRA-',
    url: 'https://example.com/JIRA-<num>',
    fix: false
  }

  run('00-basic-output', '00-basic-output', options, function (err, { file, actual, expected }) {
    t.ifError(err)
    t.is(actual, expected)
    t.same(file.messages.map(String), [])
    t.end()
  })
})

function run (inputFixture, outputFixture, options, test) {
  const inputFile = path.join(__dirname, 'fixture', inputFixture + '.md')
  const outputFile = path.join(__dirname, 'fixture', outputFixture + '.md')
  const input = normalize(fs.readFileSync(inputFile, 'utf8'))
  const expected = normalize(fs.readFileSync(outputFile, 'utf8'))

  remark()
    .use({ settings: { fences: true, listItemIndent: '1' } })
    .use(mockFile)
    .use(plugin, options)
    .process(input, function (err, file) {
      const actual = normalize(String(file))
      process.nextTick(test, err, { file, actual, expected })
    })
}

function mockFile () {
  return function transform (tree, file) {
    file.path = path.join(__dirname, 'test.md')
    file.cwd = __dirname
  }
}

function normalize (md) {
  return md.trim().replace(/\r\n/g, '\n')
}
