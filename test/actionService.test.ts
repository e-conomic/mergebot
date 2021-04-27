import { describe, expect, test } from '@jest/globals'
import { InternalContext, SemVer } from '../src/models/actionContextModels'
import { shouldProcess } from '../src/services/actionService'

describe('shouldProcess', () => {
  test('returns true when all conditions are met', async () => {
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
      semVerLimit: SemVer.Minor
    }

    const result = shouldProcess(internalContext)

    expect(result).toBeTruthy()
  })

  test('returns false when action is triggered by unsupported user', async () => {
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
      semVerLimit: SemVer.Minor
    }

    const result = shouldProcess(internalContext)

    expect(result).toBeFalsy()
  })

  test('returns false when check suite did not complete successfully', async () => {
    const internalContext = new InternalContext()
    internalContext.actionContext = {
      actor: 'other[bot]',
      eventName: 'check_suite',
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
      semVerLimit: SemVer.Minor
    }

    const result = shouldProcess(internalContext)

    expect(result).toBeFalsy()
  })

  test('returns false when event is different from check_suite', async () => {
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
      semVerLimit: SemVer.Minor
    }

    const result = shouldProcess(internalContext)

    expect(result).toBeFalsy()
  })
})
