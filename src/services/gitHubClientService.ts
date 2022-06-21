import { error } from '@actions/core'
import { getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { InternalContext } from '../models/actionContextModels'

async function determineToken (internalContext: InternalContext): Promise<string> {
  if (internalContext.input.gitHubToken) {
    return internalContext.input.gitHubToken
  }

  if (!canAuthenticateAsApp(internalContext)) {
    throw new Error()
  }

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: internalContext.input.gitHubAppId,
      privateKey: internalContext.input.gitHubAppPrivateKey,
      installationId: internalContext.input.gitHubAppInstallationId
    }
  })

  // @ts-expect-error
  const { token } = await appOctokit.auth({
    type: 'installation'
  })

  return token
}

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

async function createGitHubClient (internalContext: InternalContext): Promise<InstanceType<typeof GitHub>> {
  const token = await determineToken(internalContext)
  return getOctokit(token)
}

export {
  createGitHubClient
}
