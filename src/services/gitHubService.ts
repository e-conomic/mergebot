import { error } from '@actions/core'
import { GitHub } from '@actions/github/lib/utils'
import {
  AddPrReviewersModel,
  ApprovePullRequestModel,
  GetPullRequestModel,
  MergePullRequestModel,
  PullRequestModel
} from '../models/gitHubModels'

class GitHubService {
  private readonly client: InstanceType<typeof GitHub>

  constructor (client: InstanceType<typeof GitHub>) {
    this.client = client
  }

  public async getPullRequest (request: GetPullRequestModel): Promise<PullRequestModel | undefined> {
    try {
      const { data } = await this.client.pulls.get({
        owner: request.repoOwner,
        repo: request.repoName,
        pull_number: request.prNumber
      })

      return {
        number: data.number,
        title: data.title,
        mergeable: data.mergeable
      }
    } catch (err) {
      error(`Cannot retrieve pull request ${request.prNumber}`)
      error(err)
      return undefined
    }
  }

  public async approvePullRequest (request: ApprovePullRequestModel): Promise<boolean> {
    try {
      await this.client.pulls.createReview({
        owner: request.repoOwner,
        repo: request.repoName,
        pull_number: request.prNumber,
        event: 'APPROVE'
      })
      return true
    } catch (err) {
      error(`Cannot approve pull request ${request.prNumber}`)
      error(err)
      return false
    }
  }

  public async mergePullRequest (request: MergePullRequestModel): Promise<boolean> {
    try {
      await this.client.pulls.merge({
        owner: request.repoOwner,
        pull_number: request.prNumber,
        repo: request.repoName,
        merge_method: 'squash'
      })
      return true
    } catch (err) {
      error(`Cannot merge pull request ${request.prNumber}`)
      error(err)
      return false
    }
  }

  public async addReviewersToPr (request: AddPrReviewersModel) : Promise<boolean> {
    try {
      await this.client.pulls.requestReviewers({
        owner: request.repoOwner,
        pull_number: request.prNumber,
        repo: request.repoName,
        reviewers: request.reviewers
      })
      return true
    } catch (err) {
      error(`Cannot add reviewers to pull request ${request.prNumber}`)
      error(err)
    }
    return false
  }
}

export {
  GitHubService
}
