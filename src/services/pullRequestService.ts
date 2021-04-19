import { InternalContext } from '../models/actionContextModels'
import { PullRequestModel } from '../models/gitHubModels'

function shouldMergePr (pullRequest: PullRequestModel, internalContext: InternalContext): boolean {
  if (pullRequest.labels.some(label => label.name === internalContext.input.label)) {
    return true
  }

  return false
}

export {
  shouldMergePr
}
