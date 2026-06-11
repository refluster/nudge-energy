import { Card, CommitButton } from '../components'

// 7時〜22時の需要イメージ（高さ%）。17〜20時がピーク。
const HOURS = [
  { h: 7, v: 35 }, { h: 8, v: 45 }, { h: 9, v: 40 }, { h: 10, v: 38 },
  { h: 11, v: 42 }, { h: 12, v: 50 }, { h: 13, v: 48 }, { h: 14, v: 52 },
  { h: 15, v: 58 }, { h: 16, v: 70 }, { h: 17, v: 92, peak: true },
  { h: 18, v: 100, peak: true }, { h: 19, v: 96, peak: true },
  { h: 20, v: 80 }, { h: 21, v: 60 }, { h: 22, v: 45 },
]

export default function PeakAlert() {
  return (
    <>
      <span className="badge alert">今日のお知らせ</span>
      <h1>今日の17〜19時、電気が混み合います</h1>
      <p className="lead">
        厳しい暑さで夕方の電力需要が高まる見込みです。この時間をすこし工夫するだけで、電気代の節約と停電リスクの低減につながります。
      </p>

      <Card>
        <h2>今日の電気の混み具合（予報）</h2>
        <div className="hours">
          {HOURS.map((x) => (
            <div
              key={x.h}
              className={x.peak ? 'bar peak' : 'bar'}
              style={{ height: `${x.v}%` }}
            />
          ))}
        </div>
        <div className="hours-axis">
          <span>7時</span><span>12時</span><span>17時</span><span>22時</span>
        </div>
      </Card>

      <Card>
        <h2>17〜19時にできること</h2>
        <ul className="actions">
          <li>
            <span className="icon">🍚</span>
            <div>
              <div className="title">炊飯・洗濯は16時までに済ませる</div>
              <div className="meta">タイマー予約が便利です</div>
            </div>
          </li>
          <li>
            <span className="icon">❄️</span>
            <div>
              <div className="title">エアコンは「つけたまま」設定を1℃ゆるめる</div>
              <div className="meta">こまめなON/OFFより効率的</div>
            </div>
          </li>
          <li>
            <span className="icon">🔌</span>
            <div>
              <div className="title">使っていない部屋の照明・家電をオフ</div>
              <div className="meta">約30秒でできます</div>
            </div>
          </li>
        </ul>
        <CommitButton
          id="peak-2026-06-11"
          label="今日はピークをずらしてみる"
          doneLabel="✓ 宣言しました！結果は明日お知らせします"
        />
        <p className="note">
          ご近所では 132世帯 がすでに参加を表明しています。
        </p>
      </Card>
    </>
  )
}
