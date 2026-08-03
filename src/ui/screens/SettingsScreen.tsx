import type { Preferences } from '@/game'

interface SettingsScreenProps {
  readonly preferences: Preferences
  readonly onChange: (preferences: Preferences) => void
  readonly onTutorial: () => void
  readonly onBack: () => void
}

export function SettingsScreen({ preferences, onChange, onTutorial, onBack }: SettingsScreenProps) {
  const update = (changes: Partial<Preferences>) => onChange({ ...preferences, ...changes })

  return (
    <main className="utility-screen">
      <section className="utility-card" aria-labelledby="settings-title">
        <p className="eyebrow">遊戲偏好</p>
        <h1 id="settings-title">設定</h1>
        <div className="setting-list">
          <label><span><strong>答題解說</strong><small>開啟時按「下一題」繼續</small></span><input type="checkbox" checked={preferences.explanationsEnabled} onChange={(event) => update({ explanationsEnabled: event.target.checked })} /></label>
          <label><span><strong>靜音</strong><small>關閉遊戲回饋音效</small></span><input type="checkbox" checked={preferences.muted} onChange={(event) => update({ muted: event.target.checked })} /></label>
        </div>
        <button className="primary-button" type="button" onClick={onTutorial}>重看互動教學</button>
        <button className="text-button" type="button" onClick={onBack}>回首頁</button>
      </section>
    </main>
  )
}
