import { Card } from '../components'

const ROWS = [
  { label: '省エネ上手なご近所', kwh: 248, color: 'var(--green-500)' },
  { label: 'あなたの家', kwh: 310, color: 'var(--blue-600)', me: true },
  { label: 'にた世帯の平均', kwh: 342, color: '#9aa8a0' },
]

const MAX = 360

export default function SocialComparison() {
  return (
    <>
      <span className="badge info">5月のでんき</span>
      <h1>あなたの家は、にた世帯より <span style={{ color: 'var(--green-700)' }}>9%省エネ</span> です</h1>
      <p className="lead">
        おなじ地域・おなじ家族人数の世帯と、先月の電気の使用量をくらべました。
      </p>

      <Card>
        <h2>先月の使用量くらべ（kWh）</h2>
        {ROWS.map((r) => (
          <div className="compare-row" key={r.label}>
            <div className="label">
              <span style={r.me ? { fontWeight: 700 } : undefined}>
                {r.me ? '🏠 ' : ''}{r.label}
              </span>
              <span>{r.kwh} kWh</span>
            </div>
            <div className="track">
              <div
                className="fill"
                style={{ width: `${(r.kwh / MAX) * 100}%`, background: r.color }}
              />
            </div>
          </div>
        ))}
        <p className="note">😊 よくできています！平均より少ない使用量です。</p>
      </Card>

      <Card>
        <h2>「省エネ上手」との差はあと 62kWh</h2>
        <ul className="actions">
          <li>
            <span className="icon">🌡️</span>
            <div>
              <div className="title">冷蔵庫の設定を「強」→「中」に</div>
              <div className="meta">月およそ 15kWh の節約</div>
            </div>
          </li>
          <li>
            <span className="icon">💡</span>
            <div>
              <div className="title">リビングの照明をLEDに交換</div>
              <div className="meta">月およそ 20kWh の節約</div>
            </div>
          </li>
        </ul>
      </Card>
    </>
  )
}
