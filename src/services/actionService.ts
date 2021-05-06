import { getInput, warning } from '@actions/core'
import { ActionContextRepo, InternalContext, SemVer } from '../models/actionContextModels'
import { determineSemVer } from './semVerService'
import { Context } from '@actions/github/lib/context'

function splitStringIfNotEmpty (input: string) : string[] {
  if (!input) {
    return []
  }

  return input.split(',')
}

function createInternalContext (context: Context) : InternalContext {
  return {
    actionContext: {
      actor: context.actor,
      eventName: context.eventName,
      checkSuiteConclusion: context.payload.check_suite?.conclusion ?? '',
      prNumbers: context.payload.check_suite?.pull_requests.map((pr: { number: number }) => pr.number) ?? [],
      repo: context.repo as ActionContextRepo
    },
    input: {
      gitHubToken: getInput('github_token', { required: true }),
      gitHubUser: getInput('github_user'),
      reviewers: splitStringIfNotEmpty(getInput('reviewers')),
      teamReviewers: splitStringIfNotEmpty(getInput('team_reviewers')),
      semVerLimit: determineSemVer(getInput('semver_limit'), SemVer.Patch)
    }
  }
}

function shouldProcess (internalContext : InternalContext) : boolean {
  if (internalContext.actionContext.eventName !== 'check_suite') {
    warning(`Unsupported event: ${internalContext.actionContext.eventName}, no processing will be done`)
    return false
  }

  if (internalContext.actionContext.actor !== internalContext.input.gitHubUser) {
    warning('Unsupported Github user')
    return false
  }

  return true
}

export {
  createInternalContext,
  shouldProcess
}
