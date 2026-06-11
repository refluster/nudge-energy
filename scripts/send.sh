#!/usr/bin/env bash
# WhatsApp(CallMeBot)にナッジ通知を送る。
# 使い方:
#   export NUDGE_PHONE="+81XXXXXXXXXX"   # 自分のWhatsApp番号(国番号つき)
#   export NUDGE_APIKEY="123123"         # CallMeBotのAPIキー
#   ./scripts/send.sh peak "⚡今日の17-19時は電気が混み合います。くわしくはこちら👉"
set -euo pipefail

ID="${1:?usage: send.sh <nudge-id> [message]}"
MSG="${2:-お知らせがあります👉}"
BASE_URL="${NUDGE_BASE_URL:-https://refluster.github.io/nudge-energy/}"

curl -G "https://api.callmebot.com/whatsapp.php" \
  --data-urlencode "phone=${NUDGE_PHONE:?set NUDGE_PHONE}" \
  --data-urlencode "apikey=${NUDGE_APIKEY:?set NUDGE_APIKEY}" \
  --data-urlencode "text=${MSG} ${BASE_URL}?id=${ID}"
echo
