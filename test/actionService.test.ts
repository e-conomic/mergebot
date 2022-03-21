import { Context } from '@actions/github/lib/context'
import { describe, expect, test } from '@jest/globals'
import { SemVer } from '../src/models/actionContextModels'
import { createInternalContext, shouldProcess } from '../src/services/actionService'

describe('shouldProcess', () => {
  test('returns true when all conditions are met with check_suite', async () => {
    // arrange
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    const context = new Context()
    context.actor = 'dependabot[bot]'
    context.eventName = 'check_suite'

    // act
    const result = shouldProcess(context)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns true when all conditions are met with workflow_run', async () => {
    // arrange
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    const context = new Context()
    context.actor = 'dependabot[bot]'
    context.eventName = 'check_suite'

    // act
    const result = shouldProcess(context)

    // assert
    expect(result).toBeTruthy()
  })

  test('returns false when action is triggered by unsupported user', async () => {
    // arrange
    const context = new Context()
    context.actor = 'some_user'
    context.eventName = 'check_suite'

    // act
    const result = shouldProcess(context)

    // assert
    expect(result).toBeFalsy()
  })

  test('returns false when event is not supported', async () => {
    // arrange
    const context = new Context()
    context.eventName = 'some_other_event'

    // act
    const result = shouldProcess(context)

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
        semVerMatch: SemVer.Patch
      }
    })
  })

  test('returns InternalContext instance for workflow_run', () => {
    // arrange
    process.env.INPUT_GITHUB_TOKEN = 'github_token'
    process.env.INPUT_GITHUB_USER = 'dependabot[bot]'
    process.env.INPUT_REVIEWERS = 'individual_reviewer'

    const context: Context = {
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
        eventName: 'workflow_run',
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
        semVerMatch: SemVer.Patch
      }
    })
  })
})
