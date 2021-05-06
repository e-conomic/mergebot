import { setFailed, error } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { InternalContext } from './models/actionContextModels'
import { createInternalContext, shouldProcess } from './services/actionService'
import { CheckSuiteService } from './services/checkSuiteService'
import { GitHubService } from './services/gitHubService'
import { PullRequestService } from './services/pullRequestService'

function createCheckSuiteEventService (internalContext: InternalContext) {
  const gitHubClient = getOctokit(internalContext.input.gitHubToken)
  const gitHubService = new GitHubService(gitHubClient)
  const pullRequestService = new PullRequestService()

  return new CheckSuiteService(gitHubService, pullRequestService)
}

async function start (): Promise<void> {
  const ctx = createInternalContext(context)

  if (!shouldProcess(ctx)) {
    return
  }

  const checkSuiteEventService = createCheckSuiteEventService(ctx)
  await checkSuiteEventService.handleEvent(ctx)
}

start().catch(err => {
  error(err)
  setFailed(err)
})
