const NUDGES = [
  {
    id: 'peak',
    name: '⚡ ピークシフト要請（デマンドレスポンス）',
    desc: '電力ひっ迫が予想される日の朝に送る。今日の混雑予報と「いまできる具体的な行動」を提示し、ワンタップで参加を宣言してもらう。',
    principles: ['損失回避', 'コミットメント', '社会規範'],
  },
  {
    id: 'social',
    name: '🏠 ご近所くらべ（月次レポート）',
    desc: '似た世帯との使用量比較。Opower社が確立した、最も実績のある省エネナッジ（平均2%前後の削減効果）。',
    principles: ['社会比較', 'フィードバック'],
  },
  {
    id: 'report',
    name: '🎉 週間ふりかえりレポート',
    desc: '毎週金曜に送る。節約額・CO2・チャレンジ達成状況を見せ、継続のモチベーションをつくる。',
    principles: ['フィードバック', 'ゲーミフィケーション'],
  },
  {
    id: 'action',
    name: '✅ 今日のワンアクション',
    desc: '「2分でできること1つだけ」を提案。ハードルを極限まで下げて行動の第一歩をつくる。',
    principles: ['シンプル化', 'フット・イン・ザ・ドア'],
  },
  {
    id: 'goal',
    name: '🎯 来週のチャレンジ選択',
    desc: '目標を押し付けずに「自分で選んでもらう」。選択による当事者意識で達成率を高める。',
    principles: ['コミットメント', '自己決定'],
  },
]

export default function Catalog() {
  const origin = `${location.origin}${location.pathname}`
  return (
    <>
      <h1>ナッジ配信プロトタイプ</h1>
      <p className="lead">
        WhatsAppのプッシュ通知から、生活者の行動変容をうながすコンテンツへ誘導するプロトタイプです。
        下の各サンプルが「通知のリンク先として届くページ」です。スマホ幅でご覧ください。
      </p>

      {NUDGES.map((n) => (
        <a key={n.id} className="catalog-item" href={`?id=${n.id}`}>
          <div className="name">{n.name}</div>
          <div className="desc">{n.desc}</div>
          <div className="principle">
            {n.principles.map((p) => (
              <span key={p} className="badge good" style={{ marginRight: 6 }}>
                {p}
              </span>
            ))}
          </div>
        </a>
      ))}

      <section className="card">
        <h2>📨 配信のしかた（WhatsApp）</h2>
        <p className="note" style={{ marginTop: 0 }}>
          CallMeBot経由で、ページURL入りのメッセージを自分のWhatsAppに送れます。
          <code>id</code> を変えるだけで任意のナッジに誘導できます。
        </p>
        <code className="block">{`curl -G "https://api.callmebot.com/whatsapp.php" \\
  --data-urlencode "phone=+81XXXXXXXXXX" \\
  --data-urlencode "apikey=YOUR_KEY" \\
  --data-urlencode "text=⚡今日の17-19時は電気が混み合います。詳しくはこちら👉 ${origin}?id=peak"`}</code>
      </section>
    </>
  )
}
