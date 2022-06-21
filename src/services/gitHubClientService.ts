import { error } from '@actions/core'
import { getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { InternalContext } from '../models/actionContextModels'

function canAuthenticateAsApp (internalContext: InternalContext): boolean {
  if (internalContext.input.gitHubAppId <= 0) {
    error('Cannot authenticate as GitHub App, missing github_app_id')
  }

  if (!internalContext.input.gitHubAppPrivateKey) {
    error('Cannot authenticate as GitHub App, missing github_app_private_key')
  }

  if (internalContext.input.gitHubAppInstallationId <= 0) {
    error('Cannot authenticate as GitHub App, missing github_app_installation_id')
  }

  return true
}

function createGitHubClient (internalContext: InternalContext): InstanceType<typeof GitHub> {
  if (internalContext.input.gitHubToken) {
    return getOctokit(internalContext.input.gitHubToken)
  }

  if (!canAuthenticateAsApp(internalContext)) {
    throw new Error()
  }

  return getOctokit('', {
    auth: {
      appId: internalContext.input.gitHubAppId,
      privateKey: internalContext.input.gitHubAppPrivateKey,
      installationId: internalContext.input.gitHubAppInstallationId
    }
  })
}

export {
  createGitHubClient
}
