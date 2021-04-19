import { GitHub } from '@actions/github/lib/utils'

class GitHubRequestModel {
  constructor (client: InstanceType<typeof GitHub>) {
    this.client = client
  }

    client: InstanceType<typeof GitHub>;
    prNumber: number = 0;
    repoOwner: string = '';
    repoName: string = '';
}

class GetPullRequestModel extends GitHubRequestModel {
}

class ApprovePullRequestModel extends GitHubRequestModel {
}

class MergePullRequestModel extends GitHubRequestModel {

}

class LabelModel {
    id?: number | undefined;
    // eslint-disable-next-line camelcase
    node_id?: string | undefined;
    url?: string | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    color?: string | undefined;
    default?: boolean | undefined;
}

class PullRequestModel {
  id: number = 0;
  labels: LabelModel[] = [];
}

export {
  GetPullRequestModel,
  ApprovePullRequestModel,
  MergePullRequestModel,
  PullRequestModel
}
