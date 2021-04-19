import { error } from '@actions/core'
import {
  ApprovePullRequestModel,
  GetPullRequestModel,
  MergePullRequestModel,
  PullRequestModel
} from '../models/gitHubModels'

async function getPullRequest (request: GetPullRequestModel): Promise<PullRequestModel | undefined> {
  try {
    const { data } = await request.client.pulls.get({
      owner: request.repoOwner,
      repo: request.repoName,
      pull_number: request.prNumber
    })

    return {
      id: data.id,
      labels: data.labels
    }
  } catch (err) {
    error(err)
    return undefined
  }
}

async function approvePullRequest (request: ApprovePullRequestModel): Promise<boolean> {
  try {
    await request.client.pulls.createReview({
      owner: request.repoOwner,
      repo: request.repoName,
      pull_number: request.prNumber,
      event: 'APPROVE'
    })
    return true
  } catch (err) {
    error(err)
    return false
  }
}

async function mergePullRequest (request: MergePullRequestModel): Promise<boolean> {
  try {
    await request.client.pulls.merge({
      owner: request.repoOwner,
      pull_number: request.prNumber,
      repo: request.repoName,
      merge_method: 'squash'
    })
    return true
  } catch (err) {
    error(err)
    return false
  }
}

export {
  getPullRequest,
  approvePullRequest,
  mergePullRequest
}
