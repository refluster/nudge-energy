import { useState } from 'react'
import { Card } from '../components'

const GOALS = [
  {
    id: 'bath',
    icon: '🛁',
    title: 'お風呂は家族つづけて入る',
    desc: '追いだき回数を減らして 週およそ90円の節約',
  },
  {
    id: 'aircon',
    icon: '❄️',
    title: 'エアコンの設定を27℃にする',
    desc: '1℃ゆるめるだけで 約10%の節電',
  },
  {
    id: 'standby',
    icon: '🔌',
    title: '寝る前に待機電力をカット',
    desc: '電源タップのスイッチをオフにするだけ',
  },
]

const KEY = 'nudge-goal:week-2026-W25'

export default function GoalCommit() {
  const [selected, setSelected] = useState<string | null>(() =>
    localStorage.getItem(KEY),
  )

  const choose = (id: string) => {
    localStorage.setItem(KEY, id)
    setSelected(id)
  }

  return (
    <>
      <span className="badge info">来週のチャレンジ</span>
      <h1>来週のチャレンジを 1つ えらんでください</h1>
      <p className="lead">
        えらんだチャレンジの達成ぐあいを、来週の金曜日にお知らせします。
      </p>

      <Card>
        {GOALS.map((g) => (
          <button
            key={g.id}
            className={`btn choice${selected === g.id ? ' selected' : ''}`}
            onClick={() => choose(g.id)}
          >
            <div>{g.icon} {g.title}</div>
            <div className="meta" style={{ fontWeight: 400, fontSize: 12, color: 'var(--ink-soft)' }}>
              {g.desc}
            </div>
          </button>
        ))}
        {selected ? (
          <p className="note">
            ✓ チャレンジを登録しました。応援しています！変更はいつでもできます。
          </p>
        ) : (
          <p className="note">
            目標を「自分でえらぶ」と達成率が大きく上がることがわかっています。
          </p>
        )}
      </Card>
    </>
  )
}
