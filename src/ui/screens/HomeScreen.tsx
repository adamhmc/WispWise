interface HomeScreenProps {
  readonly onStart: () => void
  readonly onOpenRules: () => void
  readonly onOpenSettings: () => void
}

export function HomeScreen({ onStart, onOpenRules, onOpenSettings }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-screen__card">
        <div className="brand-lockup">
          <span className="brand-ghost" aria-hidden="true">●</span>
          <div>
            <p className="eyebrow">WispWise</p>
            <h1>靈機一選</h1>
          </div>
        </div>
        <p className="home-screen__lead">看清楚卡牌，用最快的直覺找出唯一答案。</p>
        <ul className="home-screen__facts" aria-label="遊戲設定">
          <li>10 張卡牌</li>
          <li>不限時間</li>
          <li>單人練習</li>
        </ul>
        <button className="primary-button" type="button" onClick={onStart}>開始遊戲</button>
        <div className="secondary-actions">
          <button className="text-button" type="button" onClick={onOpenRules}>玩法說明</button>
          <button className="text-button" type="button" onClick={onOpenSettings}>設定</button>
        </div>
      </div>
    </main>
  )
}
