import { setFailed, error } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { InternalContext } from './models/actionContextModels'
import { createInternalContext, shouldProcess } from './services/actionService'
import { EventService } from './services/eventService'
import { GitHubService } from './services/gitHubService'
import { PullRequestService } from './services/pullRequestService'

function createEventService (internalContext: InternalContext) {
  const gitHubClient = getOctokit(internalContext.input.gitHubToken)
  const gitHubService = new GitHubService(gitHubClient)
  const pullRequestService = new PullRequestService()

  return new EventService(gitHubService, pullRequestService)
}

async function start (): Promise<void> {
  if (!shouldProcess(context)) {
    return
  }

  const ctx = createInternalContext(context)
  const eventService = createEventService(ctx)
  await eventService.handleEvent(ctx)
}

start().catch(err => {
  error(err)
  setFailed(err)
})
