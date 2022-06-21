class GitHubRequestModel {
  prNumber: number = 0
  repoOwner: string = ''
  repoName: string = ''
}

class GetPullRequestModel extends GitHubRequestModel {
}

class ApprovePullRequestModel extends GitHubRequestModel {
}

class MergePullRequestModel extends GitHubRequestModel {
}

class AddPrReviewersModel extends GitHubRequestModel {
  reviewers: string[] = []
  teamReviewers: string[] = []
}

class PullRequestModel {
  number: number = 0
  title: string = ''
  mergeable: boolean | null = null
}

export {
  GetPullRequestModel,
  ApprovePullRequestModel,
  MergePullRequestModel,
  PullRequestModel,
  AddPrReviewersModel
}
