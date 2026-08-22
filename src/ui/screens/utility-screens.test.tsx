import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_PREFERENCES } from '@/game'
import { ResultsScreen } from './ResultsScreen'
import { RulesScreen } from './RulesScreen'
import { SettingsScreen } from './SettingsScreen'
import { TutorialScreen } from './TutorialScreen'

describe('utility screens', () => {
  it('renders all result metrics and restart actions', async () => {
    const user = userEvent.setup()
    const onRestart = vi.fn()
    render(
      <ResultsScreen
        stats={{ total: 10, correct: 8, incorrect: 2, accuracy: 0.8, averageCorrectTimeMs: 1250 }}
        onRestart={onRestart}
        onHome={vi.fn()}
      />,
    )

    expect(screen.getByText('80%')).toBeTruthy()
    expect(screen.getByText('1.3 秒')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '再玩一次' }))
    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('links rules back to the interactive tutorial', async () => {
    const user = userEvent.setup()
    const onTutorial = vi.fn()
    render(<RulesScreen onTutorial={onTutorial} onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '直接匹配' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '排除推理' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '玩兩題教學' }))
    expect(onTutorial).toHaveBeenCalledOnce()
  })

  it('updates only the supported preferences', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SettingsScreen
        preferences={DEFAULT_PREFERENCES}
        onChange={onChange}
        onTutorial={vi.fn()}
        onBack={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: /靜音/ }))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PREFERENCES, muted: true })

    await user.click(screen.getByRole('checkbox', { name: '自動換題' }))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PREFERENCES, explanationsEnabled: false })
  })

  it('runs two interactive tutorial questions and completes', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<TutorialScreen onComplete={onComplete} onSkip={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '選擇鬼' }))
    expect(screen.getByRole('status').textContent).toContain('白色是鬼的固定顏色')
    await user.click(screen.getByRole('button', { name: '下一題' }))
    await user.click(screen.getByRole('button', { name: '選擇瓶子' }))
    await user.click(screen.getByRole('button', { name: '開始遊戲' }))

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
