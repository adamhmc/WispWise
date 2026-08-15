interface GameModeScreenProps {
  readonly step: 'game-mode' | 'multiplayer-role'
  readonly onSolo: () => void
  readonly onMultiplayer: () => void
  readonly onCreateRoom: () => void
  readonly onJoinRoom: () => void
  readonly onBack: () => void
}

export function GameModeScreen({
  step,
  onSolo,
  onMultiplayer,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: GameModeScreenProps) {
  const choosingGameMode = step === 'game-mode'

  return (
    <main className="mode-screen">
      <section className="mode-screen__card">
        <button className="text-button mode-screen__back" type="button" onClick={onBack}>
          ← 返回
        </button>
        <div className="brand-lockup">
          <span className="brand-ghost" aria-hidden="true" />
          <div>
            <p className="eyebrow">WispWise</p>
            <h1>{choosingGameMode ? '選擇遊戲模式' : '多人遊戲'}</h1>
          </div>
        </div>
        <p className="mode-screen__lead">
          {choosingGameMode
            ? '想自己練習，還是和朋友一起挑戰？'
            : '這台裝置要顯示題目，還是作為玩家手機？'}
        </p>
        <div className="mode-screen__choices">
          {choosingGameMode ? (
            <>
              <button className="choice-card choice-card--solo" type="button" onClick={onSolo}>
                <span className="choice-card__icon" aria-hidden="true">★</span>
                <span><strong>單人遊戲</strong><small>在同一台裝置看題目並作答</small></span>
              </button>
              <button className="choice-card choice-card--multi" type="button" onClick={onMultiplayer}>
                <span className="choice-card__icon" aria-hidden="true">●●</span>
                <span><strong>多人遊戲</strong><small>Host 顯示題目，玩家用手機作答</small></span>
              </button>
            </>
          ) : (
            <>
              <button className="choice-card choice-card--host" type="button" onClick={onCreateRoom}>
                <span className="choice-card__icon" aria-hidden="true">▣</span>
                <span><strong>擔任 Host</strong><small>建立房間並在桌上顯示題目</small></span>
              </button>
              <button className="choice-card choice-card--join" type="button" onClick={onJoinRoom}>
                <span className="choice-card__icon" aria-hidden="true">✓</span>
                <span><strong>加入房間</strong><small>輸入房間代碼並選擇答案</small></span>
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
