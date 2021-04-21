import { context, getOctokit } from '@actions/github'
import { getInput, warning } from '@actions/core'
import { ActionContextRepo, InternalContext } from '../models/actionContextModels'

function createInternalContext () : InternalContext {
  const gitHubToken = getInput('github_token', { required: true })

  return {
    actionContext: {
      actor: context.actor,
      eventName: context.eventName,
      checkSuiteConclusion: context.payload?.check_suite?.conclusion ?? '',
      prIds: context.payload?.check_suite?.pull_requests.map((pr: { number: number }) => pr.number) ?? [],
      repo: context.repo as ActionContextRepo
    },
    gitHubClient: getOctokit(gitHubToken),
    input: {
      gitHubToken: gitHubToken,
      gitHubUser: getInput('github_user'),
      label: getInput('label'),
      semVerMatch: getInput('semver_match')
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

  if (internalContext.actionContext.checkSuiteConclusion !== 'success') {
    warning('Check suite did not complete successfully, no processing will be done')
    return false
  }

  return true
}

export {
  createInternalContext,
  shouldProcess
}
