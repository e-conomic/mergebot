import { describe, expect, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import { PullRequestModel } from '../src/models/gitHubModels'
import { PullRequestService } from '../src/services/pullRequestService'

describe('shouldMerge', () => {
  const pullRequestService = new PullRequestService()

  test('returns true when PR should be merged', () => {
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Update from v1.0.0 to v1.0.1'

    const internalContext = new InternalContext()
    internalContext.input.semVerLimit = SemVer.Patch

    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    expect(result).toBeTruthy()
  })

  test('returns false when the PR is not mergeable', () => {
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = false
    pullRequest.title = 'Update from v1.0.0 to v1.0.1'

    const internalContext = new InternalContext()
    internalContext.input.semVerLimit = SemVer.Patch

    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    expect(result).toBeFalsy()
  })

  test('returns false when the version upgrade is higher', () => {
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Update from v1.0.0 to v1.1.1'

    const internalContext = new InternalContext()
    internalContext.input.semVerLimit = SemVer.Patch

    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    expect(result).toBeFalsy()
  })

  test('returns false when the version upgrade cannot be determined', () => {
    const pullRequest = new PullRequestModel()
    pullRequest.mergeable = true
    pullRequest.title = 'Update to v1.1.1'

    const internalContext = new InternalContext()
    internalContext.input.semVerLimit = SemVer.Patch

    const result = pullRequestService.shouldMergePr(pullRequest, internalContext)

    expect(result).toBeFalsy()
  })
})
