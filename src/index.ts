import { setFailed, error } from '@actions/core'
import { createInternalContext, shouldProcess } from './services/actionService'
import { handleEvent } from './services/eventService'

async function start (): Promise<void> {
  const ctx = createInternalContext()

  if (!shouldProcess(ctx)) {
    return
  }

  await handleEvent(ctx)
}

start().catch(err => {
  error(err)
  setFailed(err)
})
