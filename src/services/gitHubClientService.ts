import { error } from '@actions/core'
import { getOctokit } from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { Octokit } from '@octokit/rest'
import { InternalContext } from '../models/actionContextModels'
import { createAppAuth } from '@octokit/auth-app'

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

async function determineToken (internalContext: InternalContext): Promise<string> {
  if (internalContext.input.gitHubToken) {
    return internalContext.input.gitHubToken
  }

  if (!canAuthenticateAsApp(internalContext)) {
    throw new Error('Cannot authenticate mergebot')
  }

  const client = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: internalContext.input.gitHubAppId,
      privateKey: internalContext.input.gitHubAppPrivateKey,
      installationId: internalContext.input.gitHubAppInstallationId
    }
  })

  // @ts-expect-error
  const { token } = await client.auth({
    type: 'installation',
    repositoryIds: [internalContext.actionContext.repo.id]
  })

  if (!token) {
    throw new Error('GitHub App authentication failed')
  }

  return token
}

async function createGitHubClient (internalContext: InternalContext): Promise<InstanceType<typeof GitHub>> {
  const token = await determineToken(internalContext)
  return getOctokit(token)
}

export {
  createGitHubClient
}
