import { getInput, warning } from '@actions/core'
import { ActionContextRepo, InternalContext, SemVer } from '../models/actionContextModels'
import { determineSemVer } from './semVerService'
import { Context } from '@actions/github/lib/context'

function splitStringIfNotEmpty (input: string): string[] {
  if (!input) {
    return []
  }

  return input.split(',')
}

function getGitHubUser () {
  return getInput('github_user')
}

function determineEvent (context: Context): any {
  switch (context.eventName) {
    case 'check_suite':
      return context.payload.check_suite
    case 'workflow_run':
      return context.payload.workflow_run
    default:
      return null
  }
}

function createInternalContext (context: Context): InternalContext {
  const event = determineEvent(context)

  return {
    actionContext: {
      actor: context.actor,
      checkSuiteConclusion: event?.conclusion ?? '',
      eventName: context.eventName,
      prNumbers: event?.pull_requests.map((pr: { number: number }) => pr.number) ?? [],
      repo: context.repo as ActionContextRepo
    },
    input: {
      gitHubToken: getInput('github_token', { required: true }),
      gitHubUser: getGitHubUser(),
      reviewers: splitStringIfNotEmpty(getInput('reviewers')),
      teamReviewers: splitStringIfNotEmpty(getInput('team_reviewers')),
      semVerMatch: determineSemVer(getInput('semver_match'), SemVer.Patch)
    }
  }
}

function triggerIsSupported (context: Context): boolean {
  const supportedEvents = ['check_suite', 'workflow_run']
  return supportedEvents.includes(context.eventName)
}

function shouldProcess (context: Context): boolean {
  if (!triggerIsSupported(context)) {
    warning(`Unsupported event: ${context.eventName}, no processing will be done`)
    return false
  }

  if (context.actor !== getGitHubUser()) {
    warning('Unsupported Github user')
    return false
  }

  return true
}

export {
  createInternalContext,
  shouldProcess
}
