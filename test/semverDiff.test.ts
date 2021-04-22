import { expect, test } from '@jest/globals'
import semverDiff from 'semver-diff'

const testData = [
  {
    versions: ['14.14.37', '14.14.41'],
    expected: 'patch'
  },
  {
    versions: ['14.14.37', '14.15.41'],
    expected: 'minor'
  },
  {
    versions: ['14.14.37', '15.14.41'],
    expected: 'major'
  }
]

test('semverDiff returns expected diff given two versions', () => {
  testData.forEach(item => {
    const result = semverDiff(item.versions[0], item.versions[1])
    expect(result).toEqual(item.expected)
  })
})
