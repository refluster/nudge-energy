# nudge-energy

WhatsAppプッシュ通知から、エネルギー行動変容ナッジのWebコンテンツへ誘導するプロトタイプ。

```
[cron / 手動 / curl] → CallMeBot → 自分のWhatsApp → タップ → GitHub Pages (このサイト)
```

## ページ構成

- `/?` (idなし) … PM向けカタログ。全ナッジパターンの一覧と説明
- `/?id=peak` … ピークシフト要請（デマンドレスポンス）
- `/?id=social` … ご近所くらべ（社会比較）
- `/?id=report` … 週間ふりかえりレポート
- `/?id=action` … 今日のワンアクション
- `/?id=goal` … 来週のチャレンジ選択（コミットメント）

## 開発

```bash
npm install
npm run dev
```

## デプロイ (GitHub Pages)

`main` へのpushで `.github/workflows/deploy.yml` が自動デプロイします。
初回のみ、リポジトリの **Settings → Pages → Source を「GitHub Actions」** に設定してください。

公開URL: https://refluster.github.io/nudge-energy/

## WhatsApp通知の送信

[CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) を使用（自分宛て限定・無料）。

```bash
export NUDGE_PHONE="+81XXXXXXXXXX"  # 自分のWhatsApp番号
export NUDGE_APIKEY="123123"        # CallMeBotから受け取ったAPIキー
./scripts/send.sh peak "⚡今日の17-19時は電気が混み合います。くわしくはこちら👉"
```
