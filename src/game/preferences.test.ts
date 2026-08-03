import { DEFAULT_PREFERENCES } from './preferences'

describe('preference defaults', () => {
  it('starts with sound on, explanations on, and tutorial incomplete', () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      muted: false,
      explanationsEnabled: true,
      tutorialCompleted: false,
    })
  })
})
