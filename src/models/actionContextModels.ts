class ActionContextRepo {
  owner: string = ''
  repo: string = ''
  id: number = 0
}

class ActionContext {
  actor: string = ''
  eventName: string = ''
  checkSuiteConclusion: string = ''
  prNumbers: number[] = []
  repo: ActionContextRepo = new ActionContextRepo()
}

// eslint has some trouble understanding usages of enums

enum SemVer {

  Patch = 1,

  Minor = 2,

  Major = 3,

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
