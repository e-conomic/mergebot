import { InternalContext } from '../models/actionContextModels'
import { ApprovePullRequestModel, GetPullRequestModel, MergePullRequestModel, PullRequestModel } from '../models/gitHubModels'
import { approvePullRequest, getPullRequest, mergePullRequest } from './githubService'
import { shouldMergePr } from './pullRequestService'

async function getPullRequests (internalContext: InternalContext): Promise<PullRequestModel[]> {
  const pullRequestPromises: Promise<PullRequestModel | undefined>[] = []

  internalContext.actionContext.prIds.forEach(prId => {
    const request = new GetPullRequestModel(internalContext.gitHubClient)
    request.prNumber = prId
    request.repoName = internalContext.actionContext.repo.repo
    request.repoOwner = internalContext.actionContext.repo.owner
    pullRequestPromises.push(getPullRequest(request))
  })

  const pullRequests = await Promise.all(pullRequestPromises)

  const result: PullRequestModel[] = []

  pullRequests.forEach(pullRequest => {
    if (pullRequest !== undefined) {
      result.push(pullRequest)
    }
  })

  return result
}

async function handlePrMerge (
  pullRequest: PullRequestModel,
  internalContext: InternalContext
) : Promise<void> {
  const approveRequest = new ApprovePullRequestModel(internalContext.gitHubClient)
  approveRequest.prNumber = pullRequest.id
  approveRequest.repoName = internalContext.actionContext.repo.repo
  approveRequest.repoOwner = internalContext.actionContext.repo.owner

  const isApproved = await approvePullRequest(approveRequest)

  if (isApproved) {
    const mergeRequest = new MergePullRequestModel(internalContext.gitHubClient)
    mergeRequest.prNumber = pullRequest.id
    mergeRequest.repoName = internalContext.actionContext.repo.repo
    mergeRequest.repoOwner = internalContext.actionContext.repo.owner

    await mergePullRequest(mergeRequest)
  }
}

async function handleEvent (internalContext: InternalContext) : Promise<void> {
  const pullRequests = await getPullRequests(internalContext)

  const mergePullRequestPromises: Promise<void>[] = []

  pullRequests.forEach(pullRequest => {
    if (shouldMergePr(pullRequest, internalContext)) {
      mergePullRequestPromises.push(handlePrMerge(pullRequest, internalContext))
    }
  })

  await Promise.all(mergePullRequestPromises)
}

export {
  handleEvent
}
