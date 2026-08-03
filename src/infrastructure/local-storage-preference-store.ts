import { DEFAULT_PREFERENCES, type Preferences } from '@/game/preferences'
import type { PreferenceStore } from '@/ports/preference-store'

export const PREFERENCE_STORAGE_KEY = 'geesten.preferences.v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function parsePreferences(value: string | null): Preferences {
  if (!value) {
    return DEFAULT_PREFERENCES
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_PREFERENCES
    }

    const candidate = parsed as Partial<Record<keyof Preferences, unknown>>

    return {
      muted: typeof candidate.muted === 'boolean' ? candidate.muted : DEFAULT_PREFERENCES.muted,
      explanationsEnabled:
        typeof candidate.explanationsEnabled === 'boolean'
          ? candidate.explanationsEnabled
          : DEFAULT_PREFERENCES.explanationsEnabled,
      tutorialCompleted:
        typeof candidate.tutorialCompleted === 'boolean'
          ? candidate.tutorialCompleted
          : DEFAULT_PREFERENCES.tutorialCompleted,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export class LocalStoragePreferenceStore implements PreferenceStore {
  constructor(private readonly storage: StorageLike) {}

  load(): Preferences {
    try {
      return parsePreferences(this.storage.getItem(PREFERENCE_STORAGE_KEY))
    } catch {
      return DEFAULT_PREFERENCES
    }
  }

  save(preferences: Preferences): void {
    try {
      this.storage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Preferences are optional. Storage failures must not stop the game.
    }
  }
}
