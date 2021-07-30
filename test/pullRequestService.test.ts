import { describe, expect, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import { PullRequestModel } from '../src/models/gitHubModels'
import { PullRequestService } from '../src/services/pullRequestService'

describe('shouldMerge', () => {
  const pullRequestService = new PullRequestService()

  test('returns true when PR should be merged', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0 to v1.0.1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when PR should be merged with MAJOR.MINOR.PATCH.BUILD format for patch', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0.1 to v1.0.0.2'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when PR should be merged with MAJOR.MINOR.PATCH.BUILD format for minor', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0.1 to v1.1.0.2'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Minor

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when PR should be merged with minor limit', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0 to v1.1.0'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Minor

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when PR should be merged with major limit', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0 to v1.1.1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Major

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns false when the PR is not mergeable', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = false
    pullRequest.title = 'Bump package from v1.0.0 to v1.0.1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when the version upgrade is higher', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0 to v1.1.1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when the version upgrade cannot be determined', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1-beta to v1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when title does not match expected format', () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package to v1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'success'
    internalContext.input.semVerMatch = SemVer.Patch

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when check suite did not complete successfully', async () => {
    // arrange
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Bump package from v1.0.0 to v1.0.1'

    const internalContext = new InternalContext()
    internalContext.actionContext.checkSuiteConclusion = 'other'

    // act
    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    // assert
    expect(result).toBeFalsy()
  })
})
