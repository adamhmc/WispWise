import type { Preferences } from '@/game/preferences'

export interface PreferenceStore {
  load(): Preferences
  save(preferences: Preferences): void
}
