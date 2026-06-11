import { Card } from '../components'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const HIT = [true, true, false, true, true, true, false]

export default function WeeklyReport() {
  return (
    <>
      <span className="badge good">今週のふりかえり</span>
      <h1>今週は 420円 おトクでした 🎉</h1>
      <p className="lead">
        先週とくらべて、電気の使い方が上手になっています。この調子！
      </p>

      <Card>
        <div className="big-number">
          ▲420<small> 円（先週比）</small>
        </div>
        <div className="stat-grid" style={{ marginTop: 16 }}>
          <div className="stat">
            <div className="v">▲8.2 kWh</div>
            <div className="k">使用量の削減</div>
          </div>
          <div className="stat">
            <div className="v">▲3.6 kg</div>
            <div className="k">CO₂の削減</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2>ピークずらし チャレンジ達成</h2>
        <div className="streak">
          {DAYS.map((d, i) => (
            <span key={d} className={HIT[i] ? 'hit' : ''}>
              {HIT[i] ? '⚡' : d}
            </span>
          ))}
        </div>
        <p className="note">
          今週は 7日中5日 達成。3週連続で「省エネ名人」バッジまであと2日です 🏅
        </p>
      </Card>

      <Card>
        <h2>来週のヒント</h2>
        <ul className="actions">
          <li>
            <span className="icon">🌤️</span>
            <div>
              <div className="title">来週は暑くなる予報です</div>
              <div className="meta">
                エアコンのフィルター掃除で効きがよくなり、約5%の節電になります
              </div>
            </div>
          </li>
        </ul>
      </Card>
    </>
  )
}
