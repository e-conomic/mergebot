import { error, info } from '@actions/core'
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
      const { data } = await this.client.rest.pulls.get({
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
      error(err as Error)
      return undefined
    }
  }

  public async approvePullRequest (request: ApprovePullRequestModel): Promise<boolean> {
    try {
      await this.client.rest.pulls.createReview({
        owner: request.repoOwner,
        repo: request.repoName,
        pull_number: request.prNumber,
        event: 'APPROVE'
      })
      return true
    } catch (err) {
      error(`Cannot approve pull request ${request.prNumber}`)
      error(err as Error)
      return false
    }
  }

  public async mergePullRequest (request: MergePullRequestModel): Promise<boolean> {
    try {
      await this.client.rest.pulls.merge({
        owner: request.repoOwner,
        pull_number: request.prNumber,
        repo: request.repoName,
        merge_method: 'squash'
      })
      return true
    } catch (err) {
      error(`Cannot merge pull request ${request.prNumber}`)
      error(err as Error)
      return false
    }
  }

  public async addPrReviewers (request: AddPrReviewersModel) : Promise<void> {
    try {
      await this.client.rest.pulls.requestReviewers({
        owner: request.repoOwner,
        pull_number: request.prNumber,
        repo: request.repoName,
        reviewers: this.determineReviewers(request.reviewers),
        team_reviewers: this.determineReviewers(request.teamReviewers)
      })
    } catch (err) {
      error(`Cannot add reviewers to pull request ${request.prNumber}`)
      error(err as Error)
    }
  }

  private determineReviewers (input: string[]) : string[] | undefined {
    if (input.length === 0) {
      return undefined
    }

    info(`Adding ${input.length} reviewers: ${input.join(', ')}`)

    return input
  }
}

export {
  GitHubService
}
