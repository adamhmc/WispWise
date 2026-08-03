import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

const storageValues = new Map<string, string>()
const testStorage: Storage = {
  get length() {
    return storageValues.size
  },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(key) ?? null,
  key: (index) => [...storageValues.keys()][index] ?? null,
  removeItem: (key) => storageValues.delete(key),
  setItem: (key, value) => storageValues.set(key, value),
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: testStorage,
})

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})
