import { expect, test } from '@jest/globals'
import findVersions from 'find-versions'

const testData = [
  {
    title: 'Bump @types/node from 14.14.37 to 14.14.41',
    versions: ['14.14.37', '14.14.41']
  },
  {
    title: 'Bump @types/node from v14.14.37 to v14.14.41',
    versions: ['14.14.37', '14.14.41']
  }
]

test('findVersions returns expected versions given Dependabot PR title', () => {
  testData.forEach(item => {
    const semVers = findVersions(item.title)
    expect(semVers).toEqual(item.versions)
  })
})
