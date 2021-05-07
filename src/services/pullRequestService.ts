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

    if (!this.isUpgradeAllowed(pullRequest, internalContext)) {
      warning('Upgrade is not allowed. Will not merge PR')
      return false
    }

    return true
  }

  private isUpgradeAllowed (pullRequest: PullRequestModel, internalContext: InternalContext) {
    const proposedUpgradeSection = this.getProposedUpgradeFromPrTitle(pullRequest)

    if (!proposedUpgradeSection) {
      warning('PR title does not contain enough information about the affected versions')
      return false
    }

    const proposedSemVerUpgrade = this.determineSemVerUpgrade(proposedUpgradeSection)

    if (!proposedSemVerUpgrade) {
      warning('Cannot determine the version upgrade bump')
      return false
    }

    return internalContext.input.semVerLimit >= proposedSemVerUpgrade
  }

  private getProposedUpgradeFromPrTitle (pullRequest: PullRequestModel) : string | undefined {
    const regex = /\sfrom\s(?<proposedUpgrade>.+)/iu

    const result = regex.exec(pullRequest.title)

    return result?.groups?.proposedUpgrade
  }

  private determineSemVerUpgrade (upgradeSection: string) : SemVer | undefined {
    const versions = findVersions(upgradeSection)

    if (versions.length !== 2) {
      warning(
        `Expected two versions in Dependabot PR title. Determined it contains ${versions.length}`)
      return undefined
    }

    const proposedUpgrade = semverDiff(versions[0], versions[1])

    return determineSemVer(proposedUpgrade, SemVer.Other)
  }
}

export {
  PullRequestService
}
