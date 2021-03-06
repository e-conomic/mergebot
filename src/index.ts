import { setFailed, error } from '@actions/core'
import { context } from '@actions/github'
import { InternalContext } from './models/actionContextModels'
import { createInternalContext, shouldProcess } from './services/actionService'
import { EventService } from './services/eventService'
import { createGitHubClient } from './services/gitHubClientService'
import { GitHubService } from './services/gitHubService'
import { PullRequestService } from './services/pullRequestService'

async function createEventService (internalContext: InternalContext): Promise<EventService> {
  const gitHubClient = await createGitHubClient(internalContext)
  const gitHubService = new GitHubService(gitHubClient)
  const pullRequestService = new PullRequestService()

  return new EventService(gitHubService, pullRequestService)
}

async function start (): Promise<void> {
  if (!shouldProcess(context)) {
    return
  }

  const ctx = createInternalContext(context)
  const eventService = await createEventService(ctx)
  await eventService.handleEvent(ctx)
}

start().catch(err => {
  error(err)
  setFailed(err)
})
