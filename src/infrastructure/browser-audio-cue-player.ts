export type FeedbackCue = 'correct' | 'incorrect'

export const FEEDBACK_FREQUENCIES: Readonly<Record<FeedbackCue, readonly [number, number]>> = {
  correct: [523.25, 659.25],
  incorrect: [220, 174.61],
}

export class BrowserAudioCuePlayer {
  play(cue: FeedbackCue): void {
    const AudioContextConstructor = window.AudioContext
    if (!AudioContextConstructor) return

    try {
      const context = new AudioContextConstructor()
      const notes = FEEDBACK_FREQUENCIES[cue]

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const start = context.currentTime + index * 0.09
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.09, start + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(start)
        oscillator.stop(start + 0.14)
      })
    } catch {
      // Audio feedback is optional and must never interrupt play.
    }
  }
}
