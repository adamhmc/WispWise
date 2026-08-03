import { BrowserAudioCuePlayer, FEEDBACK_FREQUENCIES } from './browser-audio-cue-player'

describe('BrowserAudioCuePlayer', () => {
  it('defines an ascending success cue and descending error cue', () => {
    expect(FEEDBACK_FREQUENCIES.correct[1]).toBeGreaterThan(FEEDBACK_FREQUENCIES.correct[0])
    expect(FEEDBACK_FREQUENCIES.incorrect[1]).toBeLessThan(FEEDBACK_FREQUENCIES.incorrect[0])
  })

  it('is safe when Web Audio is unavailable', () => {
    expect(() => new BrowserAudioCuePlayer().play('correct')).not.toThrow()
  })
})
