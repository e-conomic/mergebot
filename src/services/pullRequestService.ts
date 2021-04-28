import { InternalContext, SemVer } from '../models/actionContextModels'
import { PullRequestModel } from '../models/gitHubModels'
import findVersions from 'find-versions'
import semverDiff from 'semver-diff'
import { determineSemVer } from './semVerService'
import { warning } from '@actions/core'

class PullRequestService {
  public shouldMergePr (pullRequest: PullRequestModel, internalContext: InternalContext): boolean {
    if (internalContext.actionContext.checkSuiteConclusion !== 'success') {
      warning('Check suite did not complete successfully')
      return false
    }

    if (!pullRequest.mergeable) {
      warning('Pull request is not mergeable')
      return false
    }

    if (this.isActualSemVerHigher(pullRequest, internalContext)) {
      warning('Version upgrade is higher than configured. Will not merge PR')
      return false
    }

    return true
  }

  private isActualSemVerHigher (pullRequest: PullRequestModel, internalContext: InternalContext) {
    const semVer = this.determineSemVerUpgrade(pullRequest)

    if (!semVer) {
      return true
    }

    return semVer > internalContext.input.semVerLimit
  }

  private determineSemVerUpgrade (pullRequest: PullRequestModel) : SemVer | undefined {
    const versions = findVersions(pullRequest.title)

    if (versions.length !== 2) {
      warning(
        'Identified more than two versions in Dependabot PR title. Will not merge PR')
      return undefined
    }

    const proposedUpgrade = semverDiff(versions[0], versions[1])

    return determineSemVer(proposedUpgrade, SemVer.Other)
  }
}

export {
  PullRequestService
}
