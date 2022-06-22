# Mergebot

Mergebot is a GitHub Action that automates merging Dependabot PRs. It supports semantic versioning, enabling you to choose how big of an upgrade bump you allow, and automatically adds reviewers in case the PR requires special attention

Even though it is designed with Dependabot in mind, Mergebot can also be used to automate other GitHub users' PRs. You simply need to override the default input for this

## Mergebot config

Below is a sample workflow that uses Mergebot. Mergebot supports the check_suite and workflow_run triggers, ensuring it only runs after all the other checks. The example workflow below shows how it can be configured in either case ('Pull request' is the name of the workflow after which Mergebot should be triggered, so you'll need to replace that with your own)

    name: Mergebot

    on:
      check_suite:
        types:
          - completed
      workflow_run:
        workflows:
          - Pull request
        types:
          - completed

    jobs:
      mergebot:
        name: Mergebot
        runs-on: ubuntu-latest
        steps:
          - uses: e-conomic/mergebot@v1
            with:
              github_token: ${{ secrets.GITHUB_TOKEN }}

## Mergebot inputs

| Input | Required | Supported options | Default | Note |
| --- | --- | --- | --- | --- |
| github_user | no | | dependabot[bot] | Only one value required | 
| github_token | no | | | Use ${{ secrets.GITHUB_TOKEN}} or PAT |
| github_app_id | no | | | Use the GitHub App identifier |
| github_app_private_key | no | | | Use the GitHub App generated private key |
| github_app_installation_id | no | | | Use the GitHub App installation identifier |
| semver_match | no | patch, minor, major | patch | Only one value required |
| reviewers | no | | | Comma separated list of GitHub usernames |
| team_reviewers | no | | | Comma separated list of GitHub team slugs. Requires PAT |

## Token vs GitHub App authentication

Mergebot supports two ways of authenticating, namely using a token (provided via the `github_token` input) or as a GitHub App (using the inputs that start with `github_app`. Why the two options?

The standard token provided by GitHub works fine, as long as you do not want or need to have subsequent workflows triggering. For example, workflows that should fire when pushing to the branch Dependabot is configured to open PRs against (typically the main or master branch) will no longer work as such. This is by design, to avoid recursive runs according to GitHub

The alternative that we prefer is to use a GitHub App, and provide the necessary credentials to Mergebot to authenticate and merge the PR. Subsequent workflows will trigger just fine, since Mergebot used a custom token and not the standard one

## Notes on usage
Mergebot uses patch as the default semver_match option as it is safest. However, if you want to enable a higher bump, you can use minor (which also includes patch) or major (which also includes minor and patch)

Mergebot can use the standard token available to GitHub actions to add reviewers, but, unfortunately, GitHub prevents it from doing the same for teams as the token lacks the necessary permissions. As such, you will need to generate a PAT which includes these permissions and use it instead
Another alternative is to create a secret that includes a list of users, and use it as the value of the <b>reviewers</b> input
