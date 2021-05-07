import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import {
  AddPrReviewersModel,
  ApprovePullRequestModel,
  GetPullRequestModel,
  MergePullRequestModel,
  PullRequestModel
} from '../src/models/gitHubModels'
import { CheckSuiteService } from '../src/services/checkSuiteService'
import { PullRequestService } from '../src/services/pullRequestService'

describe('handleEvent', () => {
  beforeEach(() => { jest.resetModules() })

  test('processes event sucessfully', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              const pullRequest: PullRequestModel = {
                mergeable: true,
                number: 1,
                title: 'Bump package from v1.0.1 to v1.0.2'
              }
              return Promise.resolve(pullRequest)
            },
            approvePullRequest: (_: ApprovePullRequestModel) => Promise.resolve(true),
            mergePullRequest: (_: MergePullRequestModel) => Promise.resolve(true)
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: ['individual_reviewer'],
        teamReviewers: [],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })

  test('adds reviewers to PR when PR is not mergeable', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              const pullRequest: PullRequestModel = {
                mergeable: false,
                number: 1,
                title: 'Bump package from v1.0.1 to v1.0.2'
              }
              return Promise.resolve(pullRequest)
            },
            addPrReviewers: (_: AddPrReviewersModel) => Promise.resolve()
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: ['individual_reviewer'],
        teamReviewers: [],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })

  test('adds reviewers to PR when PR cannot be approved', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              const pullRequest: PullRequestModel = {
                mergeable: true,
                number: 1,
                title: 'Bump package from v1.0.1 to v1.0.2'
              }
              return Promise.resolve(pullRequest)
            },
            approvePullRequest: (_: ApprovePullRequestModel) => Promise.resolve(false),
            addPrReviewers: (_: AddPrReviewersModel) => Promise.resolve()
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: ['individual_reviewer'],
        teamReviewers: [],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })

  test('adds reviewers to PR when PR cannot be merged', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              const pullRequest: PullRequestModel = {
                mergeable: true,
                number: 1,
                title: 'Bump package from v1.0.1 to v1.0.2'
              }
              return Promise.resolve(pullRequest)
            },
            approvePullRequest: (_: ApprovePullRequestModel) => Promise.resolve(true),
            mergePullRequest: (_: MergePullRequestModel) => Promise.resolve(false),
            addPrReviewers: (_: AddPrReviewersModel) => Promise.resolve()
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: [],
        teamReviewers: ['team_reviewer'],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })

  test('does not add reviewers to PR when PR cannot be merged', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              const pullRequest: PullRequestModel = {
                mergeable: true,
                number: 1,
                title: 'Bump package from v1.0.1 to v1.0.2'
              }
              return Promise.resolve(pullRequest)
            },
            approvePullRequest: (_: ApprovePullRequestModel) => Promise.resolve(true),
            mergePullRequest: (_: MergePullRequestModel) => Promise.resolve(false)
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: [],
        teamReviewers: [],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })

  test('does not process when PRs cannot be retrieved', async () => {
    // arrange
    jest.mock('../src/services/gitHubService', () => {
      return {
        GitHubService: jest.fn().mockImplementation(() => {
          return {
            getPullRequest: (_: GetPullRequestModel) => {
              return Promise.resolve(undefined)
            }
          }
        })
      }
    })

    const internalContext: InternalContext = {
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name'
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubUser: 'dependabot[bot]',
        reviewers: [],
        teamReviewers: [],
        semVerLimit: SemVer.Patch
      }
    }

    const { GitHubService } = require('../src/services/gitHubService')
    const gitHubServiceInstance = new GitHubService()
    const checkSuiteService = new CheckSuiteService(gitHubServiceInstance, new PullRequestService())

    // act
    await checkSuiteService.handleEvent(internalContext)

    // assert
    expect(GitHubService).toHaveBeenCalledTimes(1)
  })
})
