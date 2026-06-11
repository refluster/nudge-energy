import { Card, CommitButton } from '../components'

export default function OneAction() {
  return (
    <>
      <span className="badge warn">今日のワンアクション</span>
      <h1>テレビの「クイック起動」をオフにしませんか？</h1>
      <p className="lead">
        今日はこれだけ。所要時間はたったの2分です。
      </p>

      <Card>
        <div className="big-number">
          年間 約1,200<small> 円の節約</small>
        </div>
        <p className="note" style={{ marginTop: 8 }}>
          クイック起動は待機中もずっと電気を使っています。オフにしても、リモコンでの起動が数秒おそくなるだけです。
        </p>
      </Card>

      <Card>
        <h2>やりかた（2分）</h2>
        <ul className="actions">
          <li>
            <span className="icon">1️⃣</span>
            <div>
              <div className="title">テレビのリモコンで「設定」を開く</div>
            </div>
          </li>
          <li>
            <span className="icon">2️⃣</span>
            <div>
              <div className="title">「省エネ設定」または「電源設定」を選ぶ</div>
            </div>
          </li>
          <li>
            <span className="icon">3️⃣</span>
            <div>
              <div className="title">「クイック起動」をオフにする</div>
            </div>
          </li>
        </ul>
        <CommitButton
          id="oneaction-tv-quickstart"
          label="やってみた！"
          doneLabel="✓ ナイス！今月のワンアクション 3個目です"
        />
      </Card>
    </>
  )
}
