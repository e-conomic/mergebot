import { SemVer } from '../models/actionContextModels'

function determineSemVer (input: string | null | undefined, fallback: SemVer): SemVer {
  switch (input?.trim().toLowerCase()) {
    case 'patch':
      return SemVer.Patch
    case 'minor':
      return SemVer.Minor
    case 'major':
      return SemVer.Major
    default:
      return fallback
  }
}

export {
  determineSemVer
}
