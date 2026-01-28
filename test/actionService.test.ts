import { context } from '@actions/github'
import { describe, expect, test } from '@jest/globals'
import { SemVer } from '../src/models/actionContextModels'
import { createInternalContext, shouldProcess } from '../src/services/actionService'

type Context = typeof context

function createMockContext (overrides: Partial<Context>): Context {
  return {
    actor: '',
    eventName: '',
    payload: {},
    repo: { owner: '', repo: '' },
    sha: '',
    ref: '',
    workflow: '',
    action: '',
    job: '',
    runNumber: 0,
    runId: 0,
    runAttempt: 0,
    issue: { owner: '', repo: '', number: 0 },
    apiUrl: '',
    serverUrl: '',
    graphqlUrl: '',
    ...overrides
  }
}

describe('shouldProcess', () => {
  test('returns true when all conditions are met with check_suite', async () => {
    // arrange
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    const ctx = createMockContext({
      actor: 'dependabot[bot]',
      eventName: 'check_suite'
    })

    // act
    const result = shouldProcess(ctx)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when all conditions are met with workflow_run', async () => {
    // arrange
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    const ctx = createMockContext({
      actor: 'dependabot[bot]',
      eventName: 'check_suite'
    })

    // act
    const result = shouldProcess(ctx)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns false when action is triggered by unsupported user', async () => {
    // arrange
    const ctx = createMockContext({
      actor: 'some_user',
      eventName: 'check_suite'
    })

    // act
    const result = shouldProcess(ctx)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when event is not supported', async () => {
    // arrange
    const ctx = createMockContext({
      eventName: 'some_other_event'
    })

    // act
    const result = shouldProcess(ctx)

    // assert
    expect(result).toBeFalsy()
  })
})

describe('createInternalContext', () => {
  test('returns InternalContext instance for check_suite', () => {
    // arrange
    process.env.INPUT_GITHUB_TOKEN = 'github_token'
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    process.env.INPUT_REVIEWERS = 'individual_reviewer'

    const ctx = createMockContext({
      actor: 'dependabot[bot]',
      eventName: 'check_suite',
      payload: {
        check_suite: {
          conclusion: 'success',
          pull_requests: [
            {
              number: 1
            }
          ]
        },
        repository: {
          id: 1,
          name: 'repo_name',
          owner: { login: 'repo_owner', name: 'repo_owner' }
        }
      },
      repo: {
        owner: 'repo_owner',
        repo: 'repo_name'
      }
    })

    // act
    const result = createInternalContext(ctx)

    // assert
    expect(result).toBeDefined()
    expect(result).toStrictEqual({
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'check_suite',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name',
          id: 1
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubAppId: 0,
        gitHubAppPrivateKey: '',
        gitHubAppInstallationId: 0,
        gitHubUser: 'dependabot[bot]',
        reviewers: ['individual_reviewer'],
        teamReviewers: [],
        semVerMatch: SemVer.Patch
      }
    })
  })

  test('returns InternalContext instance for workflow_run', () => {
    // arrange
    process.env.INPUT_GITHUB_TOKEN = 'github_token'
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    process.env.INPUT_REVIEWERS = 'individual_reviewer'

    const ctx = createMockContext({
      actor: 'dependabot[bot]',
      eventName: 'workflow_run',
      payload: {
        workflow_run: {
          conclusion: 'success',
          pull_requests: [
            {
              number: 1
            }
          ]
        },
        repository: {
          id: 1,
          name: 'repo_name',
          owner: { login: 'repo_owner', name: 'repo_owner' }
        }
      },
      repo: {
        owner: 'repo_owner',
        repo: 'repo_name'
      }
    })

    // act
    const result = createInternalContext(ctx)

    // assert
    expect(result).toBeDefined()
    expect(result).toStrictEqual({
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'workflow_run',
        checkSuiteConclusion: 'success',
        prNumbers: [1],
        repo: {
          owner: 'repo_owner',
          repo: 'repo_name',
          id: 1
        }
      },
      input: {
        gitHubToken: 'github_token',
        gitHubAppId: 0,
        gitHubAppPrivateKey: '',
        gitHubAppInstallationId: 0,
        gitHubUser: 'dependabot[bot]',
        reviewers: ['individual_reviewer'],
        teamReviewers: [],
        semVerMatch: SemVer.Patch
      }
    })
  })
})
