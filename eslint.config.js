const neostandard = require('neostandard')

module.exports = neostandard({
  ts: true,
  env: ['node', 'jest'],
  ignores: ['dist/**', 'lib/**']
}) 