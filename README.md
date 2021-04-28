# Mergebot

Mergebot is a GitHub Action that automates merging Dependabot PRs. It supports semantic versioning, enabling you to choose how big of an upgrade bump you allow, and automatically adds reviewers in case the PR requires special attention

Even though it is designed with Dependabot in mind, Mergebot can also be used to automate other GitHub users' PRs. You simply need to override the default input for this

# Dependabot config

Below is a sample dependabot.yml. Notice the schedule is set to daily. This makes the process less conflict-prone. Mergebot can run with any Dependabot config

    version: 2
    updates:
      - package-ecosystem: docker
        directory: /
        schedule:
          interval: daily
      - package-ecosystem: npm
        directory: /
        schedule:
          interval: daily
      - package-ecosystem: nuget
        directory: /
        schedule:
          interval: daily

# Mergebot config

Below is a sample workflow that uses Mergebot. Mergebot only supports the check_suite trigger, ensuring it only runs after all the other checks

    name: Dependabot auto merge

    on:
      check_suite:
        types:
          - completed

    jobs:
      dependabot-auto-merge:
        runs-on: ubuntu-latest
        steps:
          - uses: e-conomic/mergebot@v1
            with:
              github_token: ${{ secrets.GITHUB_TOKEN }}
              reviewers: 'reviewer1,reviewer2,reviewer3'

# Mergebot inputs

| Input | Required | Supported options | Default | Note |
| --- | --- | --- | --- | --- |
| github_user | no | | dependabot[bot] | Only one value required | 
| github_token | yes | | | Use ${{ secrets.GITHUB_TOKEN}} or PAT |
| semver_match | no | patch minor major | patch | Only one value required |
| reviewers | no | | | Comma separated list of GitHub usernames |
| team_reviewers | no | | | Comma separated list of GitHub team slugs. Requires PAT | 

<br/>
Mergebot uses patch as the default semver_match option as it is safest. However, if you want to enable a higher bump, you can use minor (which also includes patch) or major (which also includes minor and patch)

Mergebot can use the standard token available to GitHub actions to add reviewers, but, unfortunately, GitHub prevents it from doing the same for teams as the token lacks the necessary permissions. As such, you will need to generate a PAT which includes these permissions and use it instead
Another alternative is to create a secret that includes a list of users, and use it as the value of the <b>reviewers</b> input

