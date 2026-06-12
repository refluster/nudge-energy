# WhatsAppユーザ800人への通知 — 方式リサーチと考察（米国CA州展開版）

対象: 本リポジトリの「ナッジ通知 → GitHub Pagesコンテンツへ誘導」の仕組みを、
現状の自分宛てプロトタイプから **米国カリフォルニア州の実ユーザ800人** へ
スケールさせる場合の選択肢を整理する。

- 配信規模の基準: **1人あたり平均2通/日 × 800人 = 1,600通/日（約48,000通/月）**
- 受信者は米国(+1)番号を想定

調査日: 2026-06-12（2026-06-12 改訂: 米国展開前提に書き換え、WABA認証・オンボーディング・CRM連携を追記）

---

## 0. 現状の実装

`scripts/send.sh` が [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) の
無料APIを `curl` で叩き、**自分のWhatsApp番号宛てに**テキスト + コンテンツURLを送っている。

```
[cron / 手動 / curl] → CallMeBot → 自分のWhatsApp → タップ → GitHub Pages
```

---

## 1. ⚠️ 米国展開での最重要制約: Marketingテンプレートは米国宛てに送れない

**Metaは2025年4月1日から、米国(+1)の電話番号宛てのMarketingカテゴリのテンプレート配信を
停止しており、2026年6月時点でも解除されておらず、再開時期も未発表**
（[Manychat告知](https://help.manychat.com/hc/en-us/articles/19328856186780-Temporary-pause-on-WhatsApp-Marketing-Templates-in-the-US)、
[HubSpot告知](https://community.hubspot.com/t5/Releases-and-Updates/Important-WhatsApp-Update-Marketing-Template-Pause-in-the-U-S/ba-p/1111838)）。
Metaの説明は「米国ではWhatsAppがまだ成長初期で、ユーザのMarketingメッセージへの
エンゲージメントが低いため」。

米国宛てに引き続き送信できるのは:

- **Utility** テンプレート（ユーザの行動・契約に紐づく非販促通知）
- **Authentication** テンプレート（OTP）
- ユーザ起点の**24時間カスタマーサービスウィンドウ内**の自由文メッセージ（無料）

**本プロジェクトへの含意:** ナッジ通知を「汎用の販促」として設計すると、コスト以前に
**そもそも配信できない**。「契約者本人の電力使用状況に基づくピークシフト要請・週次レポート」
という、**ユーザのアカウント/サービスに紐づくUtilityテンプレート**として文面設計し
審査を通すことが、米国展開の必須条件になる。これはコスト面でも最安カテゴリであり、
方針として一石二鳥。テンプレート審査でMarketing判定されないよう、割引・宣伝的文言を
避け、当人固有の情報（使用量・契約プラン等）への言及を含めるのが定石。

---

## 2. パターンA: CallMeBotのまま800人に送る

### 規約・信頼性

- [公式FAQ](https://www.callmebot.com/faq/) が明言: 無料APIは **個人利用（自分宛て通知）専用**。
  顧客への送信用途には textmebot.com や Twilio を案内している → 800人への配信は規約違反
- WhatsApp(Meta)の**非公式**ゲートウェイ。番号ブロック・サービス停止のリスクが常にある
- SLAなし・テキストのみ・レート制限あり・配信成否のトラッキング不可

### ユーザオンボーディング（特殊）

CallMeBotにはビジネスアカウントという概念がなく、**受信者本人が自分でAPIキーを発行する**
独特のフローになる。800人に強いる場合:

1. ユーザがCallMeBotの電話番号を自分の連絡先に追加
2. ユーザがその番号へ有効化メッセージ（"I allow callmebot to send me messages"）を送信
3. CallMeBotから**ユーザ個別のAPIキー**が返信される
4. ユーザがそのAPIキーと電話番号を**運営側に提出**（フォーム等で回収）
5. 運営はユーザごとの `phone` + `apikey` のペアを管理して1人ずつAPIを叩く

→ 手順が多く脱落率が高い、APIキーという秘密情報をユーザに扱わせる、送信元が
CallMeBotの共有番号でブランド表示もできない、と**オンボーディング設計として破綻**している。

### 結論

**不適。** 規約・信頼性・オンボーディングのすべてで成立しない。
開発者個人の動作確認用として現状用途に限定する。

---

## 3. 公式ルート共通の前提（パターンB/C/D共通）

| 項目 | 内容 |
|---|---|
| WABA | WhatsApp Business Account をMeta Business Manager上に作成 |
| ビジネス認証 | 未認証は250ユニーク宛先/日。認証完了でTier 1 = **1,000ユニーク宛先/日** |
| Tier制限の数え方 | 「24時間内のユニーク**宛先数**」であり通数ではない → 800人×2通/日は**Tier 1で収まる**（800 < 1,000）。スパム報告等でQuality Ratingが下がると枠が縮小・停止 |
| 専用電話番号 | 通常のWhatsAppアプリと未連携の番号をWABAに登録（固定電話も音声認証で可） |
| テンプレート承認 | 企業発信（24hウィンドウ外）は事前承認テンプレートのみ。**米国宛てはUtility/Authenticationのみ配信可**（§1） |
| オプトイン | 受信者の明示的な事前同意が必須（§7） |
| 料金 | 2025年7月からテンプレート1通ごとの従量課金。受信者の国番号でレート決定 |

### 米国宛てのMeta料金（2026年レートカードベースの目安）

| カテゴリ | 単価/通 | 備考 |
|---|---|---|
| Utility | **$0.004** （情報源により$0.0034〜$0.006の幅） | 24hウィンドウ内なら**無料** |
| Authentication | $0.0135 | OTP用途 |
| Marketing | ($0.025) | **米国宛ては配信停止中**（§1） |
| Service（ユーザ起点24hウィンドウ内の返信） | 無料 | |

レートは改定されるため、予算化前に
[Meta公式レートカード](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
で要確認。

### コスト試算（1,600通/日 = 48,000通/月、全通Utilityテンプレート想定）

| 費目 | B: Cloud API直 | C: AWS EUM Social | D: Twilio |
|---|---|---|---|
| Meta費用 (48,000 × $0.004) | $192 | $192（パススルー、ボリュームティアで逓減） | $192 |
| 経路手数料 | $0 | 48,000 × $0.005 = **$240** | 48,000 × $0.005 = **$240** |
| **月額合計（概算）** | **~$192** | **~$432** | **~$432** + 利用プラン費 |

補足: 2通/日のうちユーザ返信から24時間以内に送る分はUtilityでも無料になるため、
「ユーザが反応した日の2通目はウィンドウ内で送る」設計にすると実コストはさらに下がる。

---

## 4. WABAビジネス認証 — PMが押さえるべきプロセス

経路（B/C/D）にかかわらず必要になる、Meta Business Manager上の
**Standard Business Verification** の概要
（[360dialogガイド](https://docs.360dialog.com/docs/waba-management/meta-business-verification)等）。

### 費用

- **無料**。法人としての標準ビジネス認証に料金はかからない
- 有料の「Meta Verified for Business」（月額$21.99〜のサブスク）は別物で、本件には不要
- 「緑/青バッジ（Official Business Account）」も別物で、配信には不要（任意・後から申請可）

### 提出する情報・書類（米国法人の場合）

| 提出物 | 例 | 注意点 |
|---|---|---|
| 法人の正式名称 | Articles of Incorporation, IRSのEINレター(SS-4/147C) | Business Manager登録名と**一字一句一致**させる |
| 所在地・電話番号 | 公共料金請求書、銀行取引明細、リース契約書 | 書類上の住所と登録住所の一致が必須 |
| 事業ドメイン | 会社Webサイト | サイト上に会社名の表記が必要。ドメインのDNS認証 or 会社ドメインのメール認証 |

### プロセスと典型的な期間

1. Meta Business Manager（business.facebook.com）でビジネスポートフォリオ作成
2. 設定 → セキュリティセンター → 「認証を開始」
3. 法人情報の入力 → 書類アップロード → ドメイン/メール/電話のいずれかで管理権確認
4. Meta審査: **最短数十分〜最大14営業日、書類が揃っていれば典型的には1〜5営業日**

### よくあるリジェクト要因（PMチェックリスト）

- 法人名・住所の表記ゆれ（略称、Suite番号の有無など）
- Webサイトに会社の法的名称が記載されていない
- 個人名義の書類を提出（法人名義であること）
- 並行して: WhatsApp番号の**表示名（Display Name）審査**も別途あり、
  事業名と無関係な表示名はリジェクトされる

### スケジュール上の位置づけ

認証はクリティカルパス（認証完了までは250宛先/日のため800人配信ができない）。
**書類整備込みで2〜3週間のバッファ**を見ておくのが安全。認証後、Tier 1(1,000宛先/日)で
即800人配信可能。将来1,000人を超える場合は、高Quality Ratingを保ったまま
7日間で500ユニーク宛先以上に送っていれば自動でTier 2(10,000)へ昇格する。

---

## 5. パターンB: Meta WhatsApp Cloud API を直接利用

```
EventBridge Scheduler → Lambda → Meta Graph API (Cloud API) → 800人のWhatsApp
                          ↑
              DynamoDB（宛先・オプトイン管理）
Webhook（配信ステータス・返信・オプトアウト）→ API Gateway → Lambda
```

- **費用**: API自体は無料。Meta従量課金のみ → **最安（~$192/月）**
- **Pros**: 中間マージンゼロ。Metaの新機能（Flows、ボタン等）に最速で追従
- **Cons**: アクセストークン管理、Webhook受信基盤、テンプレートライフサイクル、
  リトライ処理をすべて自前で実装・運用

---

## 6. パターンC: AWS End User Messaging Social（AWS環境がある場合の本命）

AWSのマネージドWhatsApp連携（[公式ページ](https://aws.amazon.com/end-user-messaging/whatsapp/)）。
WABAをAWSアカウントにネイティブにリンクし、送信はAWS SDK/API、受信はSNS経由。
旧Amazon Pinpointのエンゲージメント機能は2026年10月EOLで、後継が本サービス。

```
EventBridge Scheduler → Lambda → socialmessaging:SendWhatsAppMessage → 800人
受信/配信ステータス → SNS → Lambda → DynamoDB
```

- **費用**: Meta料金パススルー + AWS手数料 $0.005/送信（受信$0.001）→ **~$432/月**
- **Pros**: IAMで認証完結（Metaトークンの自前管理・ローテーション不要）、
  CloudWatch/CloudTrail/Budgetsで監視・監査・コスト管理を既存AWS運用に統合、
  受信がSNSに流れるためオプトアウト処理をLambdaで素直に組める、請求がAWSに一本化
- **Cons**: 比較的新しいサービスでリージョン制約あり。キャンペーン管理UI・
  セグメンテーションUIは無く、配信ロジックは自前（§8のCRM連携で補完）

---

## 7. パターンD: BSP（Twilio等）経由

| BSP | 料金モデル | 特徴 |
|---|---|---|
| [Twilio](https://www.twilio.com/en-us/whatsapp/pricing) | Meta実費 + $0.005/通（送受信とも） | API/SDK成熟、**SMSフォールバック**、配信ログUI |
| Vonage / Infobip | Meta実費 + 各社手数料 | マルチチャネル統合、エンタープライズサポート |
| 360dialog | 月額固定 + Meta実費パススルー | 大量配信時に従量手数料が嵩まない |

- **Pros**: WABA開設サポート、テンプレート管理UI、配信分析。米国市場では
  WhatsApp普及率が他国より低いため、**SMSへのフォールバック**を同一APIで持てるのは
  CA州展開では実質的な価値が大きい
- **Cons**: 手数料上乗せ、ベンダーロックイン

---

## 8. ユーザオンボーディング（オプトイン）設計

公式ルート（B/C/D）はプラットフォームが同じなので**ユーザ体験は共通**。
Metaポリシー上、企業発信には明示的なオプトインが必須で、
「番号を掲示しただけ」は同意と見なされない
（[Infobipのオプトインガイド](https://www.infobip.com/docs/whatsapp/compliance/user-opt-ins)）。

### 推奨フロー（公式ルート共通）

1. **入口**: Webフォーム / メール / 紙面に **QRコードまたは `wa.me/<番号>?text=...` リンク**を設置。
   タップするとWhatsAppが開き、定型の申込みメッセージがプリフィルされる
   （ユーザは送信ボタンを押すだけ。番号入力・連絡先追加は不要）
2. **ダブルオプトイン**: ユーザの最初のメッセージ受信後、確認メッセージを返し
   「YES」等の返信で購読確定（GDPR/CCPA対応の証跡としても推奨）
3. **同意文言**: 事業者名・通知の種類（ピークシフト要請、週次レポート）・頻度（1日2通程度）・
   「STOPでいつでも解除」を明記
4. **副次効果**: ユーザ起点の初回メッセージで24時間ウィンドウが開くため、
   ウェルカムメッセージ+初回ナッジを**無料の自由文**で送れる
5. **オプトアウト**: 「STOP」キーワードをWebhook/SNSで受けて即時に配信リストから除外。
   同意取得の日時・経路は監査に備えてDynamoDB等に記録

### パターン別の差分

| | A: CallMeBot | B/C/D: 公式ルート |
|---|---|---|
| ユーザの作業 | 番号を連絡先追加→有効化送信→APIキー受領→**運営に提出** | QR/リンクをタップ→送信→YES返信のみ |
| 秘密情報の扱い | ユーザ個別APIキーを回収・保管 | 不要（運営側で電話番号のみ管理） |
| 送信元表示 | CallMeBotの共有番号 | 自社番号 + 承認済み表示名 |
| 解除 | 仕組みなし（運営の自主管理） | STOPキーワード + Meta標準のブロック/通報 |

---

## 9. セグメンテーション・A/Bテスト・CRM連携

将来のセグメント配信・A/Bテストを見据えた運用ソフトウェアと、各実装パターンとの整合。

### 大前提: 1つのWhatsApp番号は1つのAPI接続にしか繋げない

WhatsApp番号はCloud APIクライアント（自前/AWS/Twilio/HubSpot/Braze…）の
**いずれか1つ**にしか接続できない。つまり「送信経路」と「キャンペーンツール」の選定は
独立ではなく、次の3方式のどれかに収束する:

- **(a) エンゲージメントツールに番号ごと任せる**: Braze等が番号を接続し配信も担う
- **(b) 送信はAWSに残し、CRMはセグメント源として使う**: CRMのリスト/セグメントを
  APIで取得してAWS側の配信パイプラインに流し込む
- **(c) 番号を2本持つ**: 例) サポート会話用はHubSpot、ナッジ配信用はAWS

### 候補ツールの評価

| ツール | WhatsApp対応 | セグメント/A-B | 各パターンとの整合 |
|---|---|---|---|
| [HubSpot](https://www.hubspot.com/products/whatsapp-integration)（CRM） | ネイティブ連携あり（Professional以上、Conversations受信箱でWABA直結） | リスト・ワークフローは強力だが、**WhatsAppの一斉配信・A/Bテストはネイティブ非対応**（[制約の整理](https://www.uptail.ai/blog/hubspot-whatsapp-integration-how-to-connect-what-you-get-and-where-the-gaps-are)） | 番号をHubSpotに繋ぐとAWS/Twilioから同番号で送れない → **方式(b)推奨**: HubSpotは顧客DB・セグメント管理に使い、リストをAPIでAWSパイプラインへ同期 |
| [Braze](https://www.braze.com/docs/user_guide/message_building_by_channel/whatsapp/) | 公式チャネルとして対応（自社WABAをembedded signupで接続） | セグメント配信・**A/Bテスト・コントロール群**・Canvasジャーニーまで揃う | 方式(a)。配信経路がBrazeに置き換わる（パターンB/C/Dの代替）。多機能だが エンタープライズ価格帯 |
| Customer.io | WhatsAppチャネル対応 | 行動データ起点のセグメント・キャンペーン、Segment連携 | 方式(a)。Brazeより軽量・中価格帯。同じく配信経路ごと移る |
| Twilio (+ Segment/Engage) | パターンDそのもの | Segment CDPでセグメント、Engageでキャンペーン | パターンDを選ぶ場合に同一ベンダーで完結するのが利点 |
| AWSネイティブ | パターンC | キャンペーンUIなし。DynamoDB+Lambdaでセグメント・A/B割付を自前実装（割付ロジック自体は単純） | 実験設計を研究目的で厳密に制御したい（無作為化・ログ完全保有）場合はむしろ好適 |

### 考察

- **研究/実証実験フェーズ（今〜800人）**: ナッジ実験はA/B割付・接触ログ・行動ログを
  研究者側で完全に管理できることが価値になるため、**パターンC（AWS）+ 自前割付 +
  HubSpot等は顧客台帳・同意管理として方式(b)で併用**が整合的。配信ログは
  すでにAWSに揃うので、GitHub Pages側の行動ログと突合しやすい
- **マーケ運用フェーズ（数千人〜、非エンジニアが配信を運用）**: Braze / Customer.io に
  番号ごと移管する方式(a)が運用負荷最小。ただし米国宛てMarketing停止（§1）の制約は
  ツールを変えても同じであり、Utilityテンプレート中心の設計は引き続き必要

---

## 10. 比較まとめと推奨

| | A: CallMeBot | B: Cloud API直 | C: AWS EUM Social | D: BSP (Twilio等) |
|---|---|---|---|---|
| 800人×2通/日の可否 | ✗ 規約違反・非公式 | ◎ | ◎ | ◎ |
| 月額概算（48,000通、Utility） | — | ~$192 | ~$432 | ~$432 + プラン費 |
| 実装・運用負荷 | （対象外） | 高 | 中（AWSに統合） | 低（UI/サポート） |
| ユーザオンボーディング | ✗ APIキー回収が必要 | ◎ QR/リンク+YES | ◎ 同左 | ◎ 同左 |
| CRM/ABテスト拡張 | — | 自前 | 自前 or CRM併用(方式b) | Segment/Engage |
| SMSフォールバック | — | なし | なし（別途AWS EUM SMS） | ◎ 同一APIで可 |

**推奨（米国CA州・800人・2通/日の前提で）:**

1. **本命は引き続きパターンC（AWS End User Messaging Social）。**
   実験ログの完全保有・IAM/監視のAWS統合・$240/月の手数料の小ささから、
   実証実験フェーズの要件に最も合う。なおAWS EUMはSMSも扱えるため、
   WhatsApp未利用ユーザへのSMS代替も同サービス圏内で追加できる
2. **米国展開の必須対応: テンプレートはUtilityカテゴリで設計・承認を取る**（§1）。
   Marketingは米国宛て配信停止中のため、これは最適化ではなく前提条件
3. **先行タスク: Metaビジネス認証（無料、書類整備込み2〜3週間バッファ）→
   専用番号・表示名審査 → Utilityテンプレート審査 → QR/wa.meリンクのオプトイン導線実装**
4. セグメンテーション/A-Bテストは、実験フェーズはAWS側で自前割付 + HubSpotを
   顧客台帳として併用（方式b）。本格マーケ運用に移る際にBraze/Customer.ioへの
   番号移管（方式a）を再検討
5. CallMeBotは開発者個人の動作確認用に現状のまま残す

---

## 参考資料

- [CallMeBot FAQ（個人利用限定の明記）](https://www.callmebot.com/faq/)
- [Meta: WhatsApp Business Platform Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- [Meta: Messaging Limits（Tier制度）](https://developers.facebook.com/docs/whatsapp/messaging-limits/)
- [Manychat: Temporary pause on WhatsApp Marketing Templates in the US](https://help.manychat.com/hc/en-us/articles/19328856186780-Temporary-pause-on-WhatsApp-Marketing-Templates-in-the-US)
- [HubSpot: WhatsApp Marketing Template Pause in the U.S.](https://community.hubspot.com/t5/Releases-and-Updates/Important-WhatsApp-Update-Marketing-Template-Pause-in-the-U-S/ba-p/1111838)
- [360dialog: Meta Business Verification](https://docs.360dialog.com/docs/waba-management/meta-business-verification)
- [Infobip: WhatsApp opt-in & user consent best practices](https://www.infobip.com/docs/whatsapp/compliance/user-opt-ins)
- [AWS End User Messaging Social（WhatsApp）](https://aws.amazon.com/end-user-messaging/whatsapp/)
- [AWS End User Messaging Pricing](https://aws.amazon.com/end-user-messaging/pricing/)
- [AWS Docs: Charged per message](https://docs.aws.amazon.com/social-messaging/latest/userguide/charged-per-message.html)
- [Twilio WhatsApp Pricing](https://www.twilio.com/en-us/whatsapp/pricing)
- [HubSpot WhatsApp Integration](https://www.hubspot.com/products/whatsapp-integration) / [連携の制約整理（Uptail）](https://www.uptail.ai/blog/hubspot-whatsapp-integration-how-to-connect-what-you-get-and-where-the-gaps-are)
- [Braze: WhatsApp channel docs](https://www.braze.com/docs/user_guide/message_building_by_channel/whatsapp/)
