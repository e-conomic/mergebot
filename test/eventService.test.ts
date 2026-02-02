import { describe, expect, jest, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import { PullRequestModel } from '../src/models/gitHubModels'
import { EventService } from '../src/services/eventService'
import { PullRequestService } from '../src/services/pullRequestService'
import { GitHubService } from '../src/services/gitHubService'

/**
 * Helper to create a fake GitHubService for testing.
 * This avoids module-level mocking and makes tests simpler.
 */
function createFakeGitHubService (options: {
  pullRequest?: PullRequestModel | undefined
  approvePullRequestResult?: boolean
  mergePullRequestResult?: boolean
}): GitHubService {
  return {
    getPullRequest: jest.fn<() => Promise<PullRequestModel | undefined>>()
      .mockResolvedValue(options.pullRequest),
    approvePullRequest: jest.fn<() => Promise<boolean>>()
      .mockResolvedValue(options.approvePullRequestResult ?? true),
    mergePullRequest: jest.fn<() => Promise<boolean>>()
      .mockResolvedValue(options.mergePullRequestResult ?? true),
    addPrReviewers: jest.fn<() => Promise<void>>()
      .mockResolvedValue(undefined)
  } as unknown as GitHubService
}

/**
 * Helper to create a standard test context.
 */
function createTestContext (overrides?: Partial<InternalContext['input']>): InternalContext {
  return {
    actionContext: {
      actor: 'dependabot[bot]',
      checkSuiteConclusion: 'success',
      eventName: 'check_suite',
      prNumbers: [1],
      repo: {
        owner: 'repo_owner',
        repo: 'repo_name',
        id: 0
      }
    },
    input: {
      gitHubToken: 'github_token',
      gitHubAppId: 0,
      gitHubAppPrivateKey: '',
      gitHubAppInstallationId: 0,
      gitHubUser: 'dependabot[bot]',
      reviewers: [],
      teamReviewers: [],
      semVerMatch: SemVer.Patch,
      ...overrides
    }
  }
}

describe('handleEvent', () => {
  test('processes event successfully', async () => {
    // Arrange - create a fake GitHubService that returns a mergeable PR
    const fakeGitHub = createFakeGitHubService({
      pullRequest: {
        mergeable: true,
        number: 1,
        title: 'Bump package from v1.0.1 to v1.0.2'
      }
    })

    const context = createTestContext({ reviewers: ['individual_reviewer'] })
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - PR was fetched, approved, and merged
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.mergePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.addPrReviewers).not.toHaveBeenCalled()
  })

  test('adds reviewers to PR when PR is not mergeable', async () => {
    // Arrange - PR is not mergeable
    const fakeGitHub = createFakeGitHubService({
      pullRequest: {
        mergeable: false,
        number: 1,
        title: 'Bump package from v1.0.1 to v1.0.2'
      }
    })

    const context = createTestContext({ reviewers: ['individual_reviewer'] })
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - reviewers should be added since PR can't be merged
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.addPrReviewers).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).not.toHaveBeenCalled()
    expect(fakeGitHub.mergePullRequest).not.toHaveBeenCalled()
  })

  test('adds reviewers to PR when PR cannot be approved', async () => {
    // Arrange - approval fails
    const fakeGitHub = createFakeGitHubService({
      pullRequest: {
        mergeable: true,
        number: 1,
        title: 'Bump package from v1.0.1 to v1.0.2'
      },
      approvePullRequestResult: false
    })

    const context = createTestContext({ reviewers: ['individual_reviewer'] })
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - reviewers should be added since approval failed
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.addPrReviewers).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.mergePullRequest).not.toHaveBeenCalled()
  })

  test('adds reviewers to PR when PR cannot be merged', async () => {
    // Arrange - merge fails
    const fakeGitHub = createFakeGitHubService({
      pullRequest: {
        mergeable: true,
        number: 1,
        title: 'Bump package from v1.0.1 to v1.0.2'
      },
      mergePullRequestResult: false
    })

    const context = createTestContext({ teamReviewers: ['team_reviewer'] })
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - reviewers should be added since merge failed
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.mergePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.addPrReviewers).toHaveBeenCalledTimes(1)
  })

  test('does not add reviewers when PR cannot be merged and no reviewers configured', async () => {
    // Arrange - merge fails but no reviewers are configured
    const fakeGitHub = createFakeGitHubService({
      pullRequest: {
        mergeable: true,
        number: 1,
        title: 'Bump package from v1.0.1 to v1.0.2'
      },
      mergePullRequestResult: false
    })

    const context = createTestContext({ reviewers: [], teamReviewers: [] })
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - no reviewers to add
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.mergePullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.addPrReviewers).not.toHaveBeenCalled()
  })

  test('does not process when PR cannot be retrieved', async () => {
    // Arrange - PR fetch returns undefined
    const fakeGitHub = createFakeGitHubService({
      pullRequest: undefined
    })

    const context = createTestContext()
    const eventService = new EventService(fakeGitHub, new PullRequestService())

    // Act
    await eventService.handleEvent(context)

    // Assert - nothing else should be called
    expect(fakeGitHub.getPullRequest).toHaveBeenCalledTimes(1)
    expect(fakeGitHub.approvePullRequest).not.toHaveBeenCalled()
    expect(fakeGitHub.mergePullRequest).not.toHaveBeenCalled()
    expect(fakeGitHub.addPrReviewers).not.toHaveBeenCalled()
  })
})
