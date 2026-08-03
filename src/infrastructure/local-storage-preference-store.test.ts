import { DEFAULT_PREFERENCES } from '@/game'
import {
  LocalStoragePreferenceStore,
  LEGACY_PREFERENCE_STORAGE_KEY,
  PREFERENCE_STORAGE_KEY,
  type StorageLike,
} from './local-storage-preference-store'

class FakeStorage implements StorageLike {
  value: string | null = null
  throwsOnRead = false
  throwsOnWrite = false

  getItem(): string | null {
    if (this.throwsOnRead) throw new Error('read failed')
    return this.value
  }

  setItem(key: string, value: string): void {
    if (this.throwsOnWrite) throw new Error('write failed')
    expect(key).toBe(PREFERENCE_STORAGE_KEY)
    this.value = value
  }
}

describe('LocalStoragePreferenceStore', () => {
  it('returns defaults when no preferences exist', () => {
    expect(new LocalStoragePreferenceStore(new FakeStorage()).load()).toEqual(DEFAULT_PREFERENCES)
  })

  it('round-trips the three allowed preferences', () => {
    const storage = new FakeStorage()
    const store = new LocalStoragePreferenceStore(storage)
    const preferences = { muted: true, explanationsEnabled: false, tutorialCompleted: true }

    store.save(preferences)

    expect(store.load()).toEqual(preferences)
  })

  it('loads preferences saved under the pre-rename storage key', () => {
    const preferences = { muted: true, explanationsEnabled: false, tutorialCompleted: true }
    const storage: StorageLike = {
      getItem: (key) => key === LEGACY_PREFERENCE_STORAGE_KEY ? JSON.stringify(preferences) : null,
      setItem: vi.fn(),
    }

    expect(new LocalStoragePreferenceStore(storage).load()).toEqual(preferences)
  })

  it('merges partial data with defaults and ignores unrelated values', () => {
    const storage = new FakeStorage()
    storage.value = JSON.stringify({ muted: true, explanationsEnabled: 'yes', extra: 'ignored' })

    expect(new LocalStoragePreferenceStore(storage).load()).toEqual({
      ...DEFAULT_PREFERENCES,
      muted: true,
    })
  })

  it.each(['not-json', 'null', '42'])('falls back for invalid stored value %s', (value) => {
    const storage = new FakeStorage()
    storage.value = value

    expect(new LocalStoragePreferenceStore(storage).load()).toEqual(DEFAULT_PREFERENCES)
  })

  it('survives storage read and write failures', () => {
    const storage = new FakeStorage()
    storage.throwsOnRead = true
    const store = new LocalStoragePreferenceStore(storage)

    expect(store.load()).toEqual(DEFAULT_PREFERENCES)

    storage.throwsOnWrite = true
    expect(() => store.save(DEFAULT_PREFERENCES)).not.toThrow()
  })
})
