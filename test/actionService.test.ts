import { Context } from '@actions/github/lib/context'
import { describe, expect, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import { createInternalContext, shouldProcess } from '../src/services/actionService'

describe('shouldProcess', () => {
  test('returns true when all conditions are met', async () => {
    // arrange
    const internalContext = new InternalContext()
    internalContext.actionContext = {
      actor: 'dependabot[bot]',
      eventName: 'check_suite',
      checkSuiteConclusion: 'success',
      prNumbers: [1],
      repo: {
        repo: 'repo',
        owner: 'owner'
      }
    }
    internalContext.input = {
      gitHubToken: 'token',
      gitHubUser: 'dependabot[bot]',
      reviewers: ['reviewer'],
      teamReviewers: ['reviewer'],
      semVerLimit: SemVer.Minor
    }

    // act
    const result = shouldProcess(internalContext)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns false when action is triggered by unsupported user', async () => {
    // arrange
    const internalContext = new InternalContext()
    internalContext.actionContext = {
      actor: 'other[bot]',
      eventName: 'check_suite',
      checkSuiteConclusion: 'success',
      prNumbers: [1],
      repo: {
        repo: 'repo',
        owner: 'owner'
      }
    }
    internalContext.input = {
      gitHubToken: 'token',
      gitHubUser: 'dependabot[bot]',
      reviewers: ['reviewer'],
      teamReviewers: ['reviewer'],
      semVerLimit: SemVer.Minor
    }

    // act
    const result = shouldProcess(internalContext)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when event is different from check_suite', async () => {
    // arrange
    const internalContext = new InternalContext()
    internalContext.actionContext = {
      actor: 'other[bot]',
      eventName: 'workflow_run',
      checkSuiteConclusion: 'neutral',
      prNumbers: [1],
      repo: {
        repo: 'repo',
        owner: 'owner'
      }
    }
    internalContext.input = {
      gitHubToken: 'token',
      gitHubUser: 'dependabot[bot]',
      reviewers: ['reviewer'],
      teamReviewers: ['reviewer'],
      semVerLimit: SemVer.Minor
    }

    // act
    const result = shouldProcess(internalContext)

    // assert
    expect(result).toBeFalsy()
  })
})

describe('createInternalContext', () => {
  test('returns InternalContext instance for check suite trigger', () => {
    // arrange
    process.env.INPUT_GITHUB_TOKEN = 'github_token'
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    process.env.INPUT_REVIEWERS = 'individual_reviewer'

    const context: Context = {
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
        }
      },
      repo: {
        owner: 'repo_owner',
        repo: 'repo_name'
      },
      sha: '',
      ref: '',
      workflow: '',
      action: '',
      job: '',
      runNumber: 1,
      runId: 1,
      issue: {
        owner: '',
        repo: '',
        number: 1
      },
      apiUrl: '',
      serverUrl: '',
      graphqlUrl: ''
    }

    // act
    const result = createInternalContext(context)

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
    })
  })

  test('returns InternalContext instance for other trigger', () => {
    // arrange
    process.env.INPUT_GITHUB_TOKEN = 'github_token'
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    process.env.INPUT_REVIEWERS = 'individual_reviewer'

    const context: Context = {
      actor: 'dependabot[bot]',
      eventName: 'workflow_run',
      payload: {
      },
      repo: {
        owner: 'repo_owner',
        repo: 'repo_name'
      },
      sha: '',
      ref: '',
      workflow: '',
      action: '',
      job: '',
      runNumber: 1,
      runId: 1,
      issue: {
        owner: '',
        repo: '',
        number: 1
      },
      apiUrl: '',
      serverUrl: '',
      graphqlUrl: ''
    }

    // act
    const result = createInternalContext(context)

    // assert
    expect(result).toBeDefined()
    expect(result).toStrictEqual({
      actionContext: {
        actor: 'dependabot[bot]',
        eventName: 'workflow_run',
        checkSuiteConclusion: '',
        prNumbers: [],
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
    })
  })
})
