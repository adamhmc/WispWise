interface RulesScreenProps {
  readonly onTutorial: () => void
  readonly onBack: () => void
}

export function RulesScreen({ onTutorial, onBack }: RulesScreenProps) {
  return (
    <main className="utility-screen">
      <section className="utility-card utility-card--wide" aria-labelledby="rules-title">
        <p className="eyebrow">玩法說明</p>
        <h1 id="rules-title">找出唯一正解</h1>
        <div className="rule-grid">
          <article><span>1</span><h2>直接匹配</h2><p>卡牌上若有物品使用自己的固定顏色，那個物品就是答案。</p></article>
          <article><span>2</span><h2>排除推理</h2><p>若兩個物品顏色都不正確，排除卡牌上的兩個物品與兩個顏色，找出剩下的唯一物品。</p></article>
        </div>
        <p className="rule-note">每題只能選一次；本局共 10 題，直接匹配與排除推理各 5 題。</p>
        <button className="primary-button" type="button" onClick={onTutorial}>玩兩題教學</button>
        <button className="text-button" type="button" onClick={onBack}>回首頁</button>
      </section>
    </main>
  )
}
