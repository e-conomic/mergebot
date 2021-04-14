import { expect, test } from '@jest/globals'
import { SemVer } from '../src/models/actionContextModels'
import { determineSemVer } from '../src/services/semVerService'

const testData = [
  {
    input: null,
    fallback: SemVer.Other,
    expected: SemVer.Other
  },
  {
    input: undefined,
    fallback: SemVer.Other,
    expected: SemVer.Other
  },
  {
    input: 'patch',
    fallback: SemVer.Other,
    expected: SemVer.Patch
  },
  {
    input: 'Minor',
    fallback: SemVer.Other,
    expected: SemVer.Minor
  },
  {
    input: 'MAJOR',
    fallback: SemVer.Other,
    expected: SemVer.Major
  }
]

test('determineSemVer returns expected result given certain input and fallback', () => {
  testData.forEach(item => {
    const result = determineSemVer(item.input, item.fallback)
    expect(result).toBe(item.expected)
  })
})
