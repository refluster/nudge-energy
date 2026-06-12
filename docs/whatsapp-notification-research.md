# WhatsAppユーザ800人への通知 — 方式リサーチと考察

対象: 本リポジトリの「ナッジ通知 → GitHub Pagesコンテンツへ誘導」の仕組みを、
現状の自分宛てプロトタイプから **800人の実ユーザ** へスケールさせる場合の選択肢を整理する。

調査日: 2026-06-12

---

## 0. 現状の実装

`scripts/send.sh` が [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) の
無料APIを `curl` で叩き、**自分のWhatsApp番号宛てに**テキスト + コンテンツURLを送っている。

```
[cron / 手動 / curl] → CallMeBot → 自分のWhatsApp → タップ → GitHub Pages
```

---

## 1. パターンA: CallMeBotのまま800人に送る

### 仕組み上できるか

技術的には「各受信者ごとに `phone` と `apikey` を変えてAPIを800回呼ぶ」ことになるが、
CallMeBotのAPIキーは **受信者本人がCallMeBotの番号を連絡先に追加し、
有効化メッセージを送って自分で取得する** 必要がある。つまり:

- 800人全員に「CallMeBotの電話番号を登録して有効化メッセージを送り、返ってきたAPIキーをこちらに提出してもらう」というオンボーディングが必要
- 送信元は自社番号ではなく **CallMeBotの共有番号**（ブランドも差出人も制御できない）

### 規約・信頼性

- [公式FAQ](https://www.callmebot.com/faq/) が明言: 無料APIは **個人利用（自分宛て通知）専用**。
  顧客への送信用途には textmebot.com や Twilio を案内している → 800人への配信は規約違反
- WhatsApp(Meta)の **非公式** ゲートウェイであり、Metaのポリシー上も未承認。番号ブロック・サービス停止のリスクが常にある
- SLAなし・ベストエフォート・テキストのみ（画像/ボタン/テンプレート不可）・レート制限あり。配信成否のトラッキング手段もない

### 結論

**不適。** CallMeBotは「自分1人へのPoC通知」が設計上の用途であり、
800人への配信は規約・信頼性・運用のすべての面で成立しない。
プロトタイプ段階の現状用途（自分宛て確認）に限定して使い続けるのが正しい。

---

## 2. 公式ルート共通の前提（どのパターンでも必要）

Meta公式の **WhatsApp Business Platform** を使う場合、経路（Meta直 / AWS / Twilio等）に
かかわらず以下が共通要件になる。

| 項目 | 内容 |
|---|---|
| WABA | WhatsApp Business Account をMeta Business Manager上に作成 |
| ビジネス認証 | 未認証だと **250ユニーク宛先/日** 上限。認証完了で Tier 1 = **1,000宛先/日** → 800人配信はTier 1で収まる |
| 専用電話番号 | 通常のWhatsAppアプリと併用不可の番号をWABAに登録 |
| テンプレート承認 | 企業発信（24時間ウィンドウ外）は **事前承認テンプレートのみ** 送信可。カテゴリは Marketing / Utility / Authentication |
| オプトイン | 受信者の明示的な事前同意が必須（Metaポリシー）。スパム報告が増えるとQuality Ratingが下がり送信枠が縮小・停止される |
| 料金 | 2025年7月から **テンプレート1通ごとの従量課金**（旧・会話単位から変更）。受信者の国番号でレートが決まる。ユーザ起点の24hウィンドウ内の返信（Service）と、ウィンドウ内のUtilityテンプレは無料 |

### 日本宛てのMeta料金の目安

日本は Metaレートカードの **"Rest of Asia Pacific"** 区分。
おおよそ Marketing ≈ $0.07台/通、Utility ≈ $0.01前後/通（数分の一〜1/10）。
レートは半年ごとに改定されるため、予算化前に
[Meta公式レートカード](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
での確認が必須。

**重要な考察 — カテゴリ判定:** 本プロジェクトの「ナッジ通知」は、一般的な販促文面だと
**Marketing** に分類され単価が高い。一方「契約者向けのピークシフト要請」「当人の使用量に
基づく週次レポート」のような、既存サービスに紐づく非販促通知として設計・申請できれば
**Utility** と認められる余地があり、コストが1/5〜1/10になる。テンプレート文面の設計が
コストを直接左右する。

### 800人配信のコスト試算（Meta費用のみ・概算）

| シナリオ | 1回の配信 | 週1配信/月 | 毎日配信/月 |
|---|---|---|---|
| Marketing (~$0.07/通) | ~$56 | ~$240 | ~$1,700 |
| Utility (~$0.01/通) | ~$8 | ~$35 | ~$240 |

---

## 3. パターンB: Meta WhatsApp Cloud API を直接利用

Metaがホストする公式API（Graph API）を直接呼ぶ。中間業者なし。

```
EventBridge Scheduler → Lambda → Meta Graph API (Cloud API) → 800人のWhatsApp
                          ↑
              DynamoDB（宛先・オプトイン管理）
Webhook（開封・返信・配信ステータス）→ API Gateway → Lambda
```

- **費用**: API自体は無料。Metaのメッセージ従量課金のみ → **最安**
- **スループット**: デフォルトで十分（80msg/秒級）。800通は数十秒で完了
- **Pros**: 中間マージンゼロ。Metaの新機能（Flows、ボタン等）に最速で追従
- **Cons**: アクセストークン管理、Webhook受信基盤、テンプレートのライフサイクル管理、
  エラー/リトライ処理をすべて自前で実装・運用する必要がある

---

## 4. パターンC: AWS End User Messaging Social（AWS環境がある場合の本命）

AWSのマネージドWhatsApp連携サービス（[公式ページ](https://aws.amazon.com/end-user-messaging/whatsapp/)）。
WABAをAWSアカウントに**ネイティブにリンク**し、送信はAWS SDK/API、受信はSNS経由で扱える。
※ 旧Amazon Pinpointのエンゲージメント機能は2026年10月EOLで、後継がこのEnd User Messaging。

```
EventBridge Scheduler → Lambda → socialmessaging:SendWhatsAppMessage → 800人
受信/配信ステータス → SNS → Lambda → DynamoDB
```

- **費用**: Metaテンプレート料金（パススルー、ボリュームティア適用）+ **AWS手数料 $0.005/送信**（受信は$0.001）。
  800通/回なら AWS分は +$4/回
- **Pros**:
  - 認証はIAMで完結（Metaのアクセストークンを自前で保管・ローテーションしなくてよい）
  - CloudWatch / CloudTrail / AWS Budgetsで監視・監査・コスト管理が既存AWS運用に統合できる
  - 受信がSNSに流れるため、返信処理やオプトアウト処理をLambdaで素直に組める
  - 請求がAWS請求に一本化（Meta側との別契約・別決済が不要）
- **Cons**:
  - 比較的新しいサービスで提供リージョンに制約あり
  - メッセージ1通あたりMeta費用に$0.005上乗せ（毎日800通でも月~$120で、運用簡素化の対価としては小さい）
  - キャンペーン管理UIのような高級機能はなく、配信ロジックは自前（Lambda等）

---

## 5. パターンD: BSP（Business Solution Provider）経由 — Twilio等

公式パートナー経由でCloud APIを使う形態。代表例:

| BSP | 料金モデル | 特徴 |
|---|---|---|
| [Twilio](https://www.twilio.com/en-us/whatsapp/pricing) | Meta実費 + **$0.005/通**（送受信とも） | API/SDKが成熟、SMSフォールバック、配信ログUI |
| Vonage / Infobip | Meta実費 + 各社手数料 | マルチチャネル統合、エンタープライズサポート |
| 360dialog | **月額固定**でMeta実費パススルー | 大量配信時に従量手数料が嵩まない |

- **Pros**: WABA開設の代行・サポート、テンプレート管理UI、配信分析、
  SMS/Email等へのフォールバックが揃っており**運用の立ち上がりが最速**
- **Cons**: 手数料上乗せ、ベンダーロックイン。AWS資産（IAM・監視）とは別管理になる

---

## 6. 比較まとめと推奨

| | A: CallMeBot | B: Cloud API直 | C: AWS EUM Social | D: BSP (Twilio等) |
|---|---|---|---|---|
| 800人配信の可否 | ✗ 規約違反・非公式 | ◎ | ◎ | ◎ |
| 800通/回の追加手数料 | — | $0 | +$4 | +$4 (Twilio) |
| 実装・運用負荷 | （対象外） | 高（トークン/Webhook自前） | 中（AWSに統合） | 低（UI/サポートあり） |
| AWS資産との親和性 | — | 中 | **高（IAM/SNS/CloudWatch）** | 低 |
| 信頼性/コンプライアンス | ✗ | ◎ 公式 | ◎ 公式 | ◎ 公式 |

**推奨:**

1. **本命: パターンC（AWS End User Messaging Social）。**
   AWS環境を既に持っている前提では、トークン管理不要・監視/請求一元化のメリットが
   $0.005/通の上乗せを十分上回る。EventBridge + Lambda + DynamoDBで
   「配信スケジュール→テンプレート送信→ステータス収集→オプトアウト反映」が完結する。
2. 配信分析UIやSMSフォールバックまで欲しい、または社内にAWS開発リソースがない場合は
   **パターンD（Twilio等のBSP）**。
3. コスト最優先・自前運用を厭わないなら **パターンB（Cloud API直）**。
4. いずれの場合も先行タスクは共通: **Metaビジネス認証 → WABA・専用番号の用意 →
   オプトイン導線の設計 → テンプレートを「Utility」で通せる文面に設計**（コストが約1/5〜1/10になる）。
5. CallMeBotは開発者個人の動作確認用として現状のまま残してよいが、実ユーザ配信には使わない。

---

## 参考資料

- [CallMeBot FAQ（個人利用限定の明記）](https://www.callmebot.com/faq/)
- [Meta: WhatsApp Business Platform Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- [Meta: Messaging Limits（Tier制度）](https://developers.facebook.com/docs/whatsapp/messaging-limits/)
- [AWS End User Messaging Social（WhatsApp）](https://aws.amazon.com/end-user-messaging/whatsapp/)
- [AWS End User Messaging Pricing](https://aws.amazon.com/end-user-messaging/pricing/)
- [AWS Docs: Charged per message](https://docs.aws.amazon.com/social-messaging/latest/userguide/charged-per-message.html)
- [AWS Blog: Automate workflows with WhatsApp using AWS End User Messaging Social](https://aws.amazon.com/blogs/messaging-and-targeting/whatsapp-aws-end-user-messaging-social/)
- [Twilio WhatsApp Pricing](https://www.twilio.com/en-us/whatsapp/pricing)
- [Twilio: Changes to WhatsApp's Pricing (July 2025)](https://help.twilio.com/articles/30304057900699-Notice-Changes-to-WhatsApp-s-Pricing-July-2025)
