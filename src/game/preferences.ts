export interface Preferences {
  readonly muted: boolean
  readonly explanationsEnabled: boolean
  readonly tutorialCompleted: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  muted: false,
  explanationsEnabled: true,
  tutorialCompleted: false,
}
