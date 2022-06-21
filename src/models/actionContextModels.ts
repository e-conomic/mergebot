class ActionContextRepo {
  owner: string = ''
  repo: string = ''
}

class ActionContext {
  actor: string = ''
  eventName: string = ''
  checkSuiteConclusion: string = ''
  prNumbers: number[] = []
  repo: ActionContextRepo = new ActionContextRepo()
}

// eslint has some trouble understanding usages of enums
// eslint-disable-next-line no-unused-vars
enum SemVer {
    // eslint-disable-next-line no-unused-vars
    Patch = 1,
    // eslint-disable-next-line no-unused-vars
    Minor = 2,
    // eslint-disable-next-line no-unused-vars
    Major = 3,
    // eslint-disable-next-line no-unused-vars
    Other = 4
}

class ActionInput {
  gitHubToken: string = ''
  gitHubAppId: number = 0
  gitHubAppPrivateKey: string = ''
  gitHubAppInstallationId: number = 0
  gitHubUser: string = ''
  reviewers: string[] = []
  teamReviewers: string[] = []
  semVerMatch: SemVer = SemVer.Patch
}

class InternalContext {
  actionContext: ActionContext = new ActionContext()
  input: ActionInput = new ActionInput()
}

export {
  InternalContext,
  ActionInput,
  ActionContext,
  ActionContextRepo,
  SemVer
}
