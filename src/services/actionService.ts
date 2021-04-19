import { context, getOctokit } from '@actions/github'
import { getInput, warning } from '@actions/core'
import { ActionContextRepo, InternalContext } from '../models/actionContextModels'

function createInternalContext () : InternalContext {
  const githubToken = getInput('github_token', { required: true })

  return {
    actionContext: {
      actor: context.actor,
      eventName: context.eventName,
      checkSuiteConclusion: context.payload.check_suite.conclusion,
      prIds: context.payload.check_suite.pull_requests.map((pr: { number: number }) => pr.number),
      repo: context.repo as ActionContextRepo
    },
    gitHubClient: getOctokit(githubToken),
    input: {
      githubToken: githubToken,
      githubUser: getInput('github_user'),
      label: getInput('label'),
      semverMatch: getInput('semver_match')
    }
  }
}

function shouldProcess (internalContext : InternalContext) : boolean {
  if (internalContext.actionContext.eventName !== 'check_suite') {
    warning(`Unsupported event: ${internalContext.actionContext.eventName}, no processing will be done`)
    return false
  }

  if (internalContext.actionContext.actor !== internalContext.input.githubUser) {
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
