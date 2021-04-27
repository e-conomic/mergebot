import { InternalContext } from '../models/actionContextModels'
import {
  AddPrReviewersModel,
  ApprovePullRequestModel,
  GetPullRequestModel,
  MergePullRequestModel,
  PullRequestModel
} from '../models/gitHubModels'
import { GitHubService } from './gitHubService'
import { PullRequestService } from './pullRequestService'

class CheckSuiteService {
  private readonly gitHubService: GitHubService
  private readonly pullRequestService: PullRequestService

  constructor (
    gitHubService: GitHubService,
    pullRequestService: PullRequestService
  ) {
    this.gitHubService = gitHubService
    this.pullRequestService = pullRequestService
  }

  public async handleEvent (internalContext: InternalContext) : Promise<void> {
    const prs = await this.getPullRequests(internalContext)

    const handlePrsPromises = this.handlePrs(prs, internalContext)

    await Promise.all(handlePrsPromises)
  }

  private async getPullRequests (internalContext: InternalContext): Promise<PullRequestModel[]> {
    const pullRequestPromises: Promise<PullRequestModel | undefined>[] = []

    internalContext.actionContext.prNumbers.forEach(prId => {
      const request: GetPullRequestModel = {
        prNumber: prId,
        repoName: internalContext.actionContext.repo.repo,
        repoOwner: internalContext.actionContext.repo.owner
      }
      pullRequestPromises.push(this.gitHubService.getPullRequest(request))
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

  private handlePrs (
    pullRequests: PullRequestModel[],
    internalContext: InternalContext
  ): Promise<void>[] {
    const handlePullRequestPromises: Promise<void>[] = []

    pullRequests.forEach(pullRequest => {
      if (this.pullRequestService.shouldMergePr(pullRequest, internalContext)) {
        handlePullRequestPromises.push(this.handlePrMerge(pullRequest, internalContext))
      } else {
        handlePullRequestPromises.push(this.addPrReviewersIfConfigured(pullRequest, internalContext))
      }
    })
    return handlePullRequestPromises
  }

  private async handlePrMerge (
    pullRequest: PullRequestModel,
    internalContext: InternalContext
  ) : Promise<void> {
    const approveRequest: ApprovePullRequestModel = {
      prNumber: pullRequest.number,
      repoName: internalContext.actionContext.repo.repo,
      repoOwner: internalContext.actionContext.repo.owner
    }

    const isApproved = await this.gitHubService.approvePullRequest(approveRequest)

    if (isApproved) {
      const mergeRequest: MergePullRequestModel = {
        prNumber: pullRequest.number,
        repoName: internalContext.actionContext.repo.repo,
        repoOwner: internalContext.actionContext.repo.owner
      }

      const isMerged = await this.gitHubService.mergePullRequest(mergeRequest)

      if (!isMerged) {
        await this.addPrReviewersIfConfigured(pullRequest, internalContext)
      }
    } else {
      await this.addPrReviewersIfConfigured(pullRequest, internalContext)
    }
  }

  private async addPrReviewersIfConfigured (
    pullRequest: PullRequestModel,
    internalContext: InternalContext
  ): Promise<void> {
    const reviewersAreConfigured = internalContext.input.reviewers.length > 0 ||
    internalContext.input.teamReviewers.length > 0

    if (!reviewersAreConfigured) {
      return
    }

    const request: AddPrReviewersModel = {
      prNumber: pullRequest.number,
      repoName: internalContext.actionContext.repo.repo,
      repoOwner: internalContext.actionContext.repo.owner,
      reviewers: internalContext.input.reviewers,
      teamReviewers: internalContext.input.teamReviewers
    }
    await this.gitHubService.addPrReviewers(request)
  }
}

export {
  CheckSuiteService
}
