# テキスト（iPhone Messagesアプリ）でのユーザ800人への通知 — 方式リサーチと考察（米国CA州展開版）

対象: ナッジ通知の配信チャネルを **iPhoneのMessagesアプリに届くテキスト** とする場合の
選択肢を、WhatsApp版リサーチ（`whatsapp-notification-research.md`）と同じ観点で整理する。

- 配信規模の基準: **1人あたり平均2通/日 × 800人 = 1,600通/日（約48,000通/月）**
- 受信者は米国(+1)番号・カリフォルニア州を想定

調査日: 2026-06-12

---

## 0. 前提: 「Messagesアプリに届くテキスト」は実際には3つのチャネル

iPhoneのMessagesアプリには次の3種類のメッセージが届く。どれを使うかで仕組みも規制も変わる。

| チャネル | 見え方 | 企業からのプッシュ配信 |
|---|---|---|
| **SMS/MMS** | 緑バブル | ◎ 可能（10DLC登録が前提） |
| **RCS for Business** | リッチ表示（認証済みブランド名・カード・画像） | ◎ 可能（iOS 18以降 + 対応キャリア） |
| **iMessage（Apple Messages for Business）** | 青バブル | ✗ **ユーザ起点のみ。企業からの先制送信は不可** |

**重要な結論を先に:** 青バブル(iMessage)での企業発信プッシュは仕組み上存在しない。
[Apple Messages for Business](https://register.apple.com/resources/messages/msp-rest-api/) は
**会話を始められるのはユーザのみ**で、MSP（LivePerson等）経由のカスタマーサポート向け
チャネル。プッシュ型ナッジの主経路にはならない（§6）。
したがって実質の選択肢は **SMS** と **RCS** になる。

---

## 1. パターンA: 簡易/非公式な手段（CallMeBot相当）

WhatsAppにおけるCallMeBotに相当する「手軽だが非公式」な手段はSMS/iMessageにも存在するが、
いずれも800人配信には使えない。

- **Email-to-SMSゲートウェイ**（`number@txt.att.net` 等）: かつての定番だが、
  キャリアがA2P規制強化に伴い縮小・廃止中。一斉送信はスパム判定で即ブロック
- **非公式iMessage API**（Sendblue、BlueBubbles等のMacリレー型）: Appleの規約外で
  CallMeBotと同じグレーゾーン。Apple IDの停止リスク、SLAなし、スケール不可
- **2025年2月以降、米国主要キャリアは10DLC未登録のA2Pトラフィックを100%遮断**
  しており（[A2P 10DLCガイド](https://tuco.ai/a2p-10dlc)）、「登録なしでこっそり送る」
  選択肢自体が消滅している

**結論: 不適。** SMSの世界はWhatsApp以上に「未登録トラフィック」への取り締まりが強い。

---

## 2. 公式ルート共通の前提①: A2P 10DLC登録（WABA認証に相当）

米国で通常の10桁番号から業務SMSを送るには、The Campaign Registry (TCR) への
**ブランド登録 + キャンペーン登録**が必須（[登録ガイド](https://www.txtimpact.com/blog/a2p-10dlc-registration-guide)）。
PMが押さえるべきポイント:

### プロセス・提出物・期間・費用

| 項目 | 内容 |
|---|---|
| ブランド登録 | EIN、法人正式名称、業種、Webサイトを提出。**$4.50（一回限り）** |
| ブランドVetting（任意だが推奨） | 第三者機関による信用スコアリング。**$40（一回限り）**。スループット枠が上がる（下記） |
| キャンペーン登録 | ユースケース、メッセージ文例、**オプトイン取得方法の証明（オプトインURLは実在しキャリアが確認できること）**、想定ボリュームを提出。審査 **$15前後 + 月額$1.50〜10** |
| 電話番号 | 10DLC番号 月額~$1 |
| 期間 | **1〜4週間**（ユースケースの複雑さと審査キューによる） |

2026年の新要件: 上場企業はAuthentication+($12.50)必須、EINは発行後15日以上経過、
オプトインURLのキャリア実査など、審査は年々厳格化している。

### スループットの注意（800人×2通/日に直結）

10DLCはブランドの信用スコアでキャリアごとの日次上限が決まる。特に
**T-Mobileは未Vettingの標準ブランドだと約2,000通/日**の枠になることがあり、
1,600通/日はこれにほぼ接触する。**$40のVettingを最初から実施**して上位枠を
確保するのが安全。

### 代替: トールフリー番号 / ショートコード

- **トールフリー(800系、月額~$2)**: 10DLCより簡易な「Verification」で送れるが、
  スループット既定値が低く、ブランド表示もない。小規模なら選択肢
- **ショートコード(5-6桁)**: 高スループットだが月額$1,000超 + 取得8〜12週間。
  800人規模ではオーバーキル

---

## 3. 公式ルート共通の前提②: TCPA等の法規制（Metaポリシーより重い）

WhatsAppのオプトインは「Metaのポリシー」だったが、SMSは**連邦法（TCPA）**であり
違反時のリスクが桁違いに大きい（[TCPA概要](https://justcall.io/blog/10dlc-compliance-guide.html)）。

- **同意**: 取引/サービス通知は express consent、**販促を含む場合は express written consent
  （明示的な書面同意。Webフォームのチェックボックス等）**が必要
- **罰則**: 未同意送信は**1通あたり$500、故意なら$1,500の法定損害賠償**。
  クラスアクション訴訟が常態化しており、800人×2通/日では理論上のエクスポージャーが莫大
- **オプトアウト**: STOP等の標準キーワード対応が必須。2025年4月施行のFCC新規則で
  「あらゆる合理的な手段での解約申し出」を10営業日以内に反映する義務
- **送信時間帯**: 受信者の現地時間で**8時〜21時**（クワイエットアワー）。
  CA州内のみなら時差管理は単純
- 文面要件: 初回確認メッセージに事業者名・頻度（"2 msgs/day"）・"Msg & data rates may apply"・
  "Reply STOP to cancel, HELP for help" を含める（CTIAガイドライン）

**本プロジェクトへの含意**: WhatsAppで問題になった「米国宛てMarketing停止」のような
チャネル側の販促禁止はSMSにはない。**書面同意さえ正しく取れば省エネ訴求も送れる**。
代わりに同意取得と記録保全の法的厳密さが要求される。

---

## 4. パターンB: AWS End User Messaging SMS（AWS環境がある場合の本命）

WhatsApp版パターンCと同じサービスファミリー
（[AWS End User Messaging](https://aws.amazon.com/end-user-messaging/)）。
10DLCのブランド/キャンペーン登録・番号取得をAWSコンソールから直接行える
（[AWSの10DLC登録ガイド](https://docs.aws.amazon.com/sms-voice/latest/userguide/registrations-10dlc.html)）。

```
EventBridge Scheduler → Lambda → sms-voice:SendTextMessage → 800人のMessagesアプリ
受信(STOP/HELP/返信) → SNS → Lambda → DynamoDB（オプトアウト即時反映）
```

- **料金**: AWS送信料 ~$0.006/セグメント + キャリア手数料 ~$0.002〜0.005/セグメント
  （キャリア手数料はマークアップなしのパススルー）≒ **合計 $0.009〜0.011/セグメント**。
  正確な現行値は[料金ページ](https://aws.amazon.com/end-user-messaging/pricing/)で要確認
- **Pros**: WhatsApp版と同一の運用基盤（IAM・CloudWatch・SNS・DynamoDB）を共有できる。
  STOPキーワードの自動処理（オプトアウトリスト管理）が組み込み。Pinpoint後継の現行サービス
- **Cons**: キャンペーン管理UIなし（WhatsApp版と同じくCRM併用で補完）

### ⚠️ コストを左右する「セグメント」の罠

SMSは160文字(GSM-7)を超えると複数セグメント課金になり、さらに
**絵文字を1つでも含むとUCS-2エンコードになり1セグメント=70文字**に縮む。
現在のナッジ文面（`⚡今日の17-19時は…👉 URL`）は絵文字+URL入りのため
**ほぼ確実に2セグメント以上**。絵文字を捨てて英数字160字以内に収めるかどうかで
月額コストが倍半分変わる（§7試算参照）。短縮URLは共有ドメイン(bit.ly等)だと
キャリアにフィルタされやすく、**自社ドメインの短縮URL**が定石。

---

## 5. パターンC: Twilio等のCPaaS経由

| 事業者 | 米国SMS料金の目安 | 特徴 |
|---|---|---|
| [Twilio](https://www.twilio.com/en-us/pricing/messaging) | ~$0.0079/セグメント + キャリア手数料 | 10DLC登録代行UI、配信ログ、Messaging Service（番号プール・クワイエットアワー管理） |
| Vonage / Sinch / Telnyx | 同水準〜やや安 | エンタープライズサポート、専用回線 |

- **Pros**: 10DLC登録・コンプライアンス機能（クワイエットアワー、オプトアウト管理、
  リンク短縮）がプロダクト化されており立ち上がりが速い。HubSpotネイティブSMSの
  バックエンドもTwilio（§8）
- **Cons**: AWS直送よりセグメント単価が2〜3割高い。AWS資産（IAM/監視）とは別管理

---

## 6. パターンD: RCS for Business（リッチ版・2026年の新顔）

RCSはSMSの後継規格で、**iOS 18以降のiPhoneでサポートされ、米国3大キャリア
(AT&T/T-Mobile/Verizon)が対応済み**（[Apple RCS解説](https://www.infobip.com/blog/apple-rcs)）。
Messagesアプリ内に**認証済みブランド名・ロゴ・リッチカード・ボタン**付きで表示され、
iOS 26.5からはE2E暗号化も開始（[Apple Newsroom](https://www.apple.com/newsroom/2026/05/end-to-end-encrypted-rcs-messaging-begins-rolling-out-today-in-beta/)）。

**AWSでもEnd User Messagingが2026年3月からRCS for Businessに対応**し、米国を含む
22カ国で利用可能（[AWS発表](https://aws.amazon.com/about-aws/whats-new/2026/03/rcs-business-messaging/)、
[RCS課金モデル](https://docs.aws.amazon.com/sms-voice/latest/userguide/rcs-billing.html)）。

- **課金**: 米国では160文字相当ごとのセグメント課金だが、SMSと違い
  **配信成功時のみ課金**。160文字超過も「Single」1通として扱われ多段課金されない
- **エージェント登録**: ブランドの「RCSエージェント」をキャリア審査に通す必要があり、
  10DLCのキャンペーン登録に相当する審査・期間が別途かかる
- **Pros**: ナッジ用途と相性が良い（画像/ボタンでGitHub Pagesへの誘導CTRが上がる、
  ブランド認証表示で信頼性向上、配信/開封の確認が取れる）
- **Cons/注意**: 受信側がiOS 18未満・RCS無効・非対応MVNOの場合に届かないため、
  **SMSフォールバック設計が必須**。TCPA等の同意要件はSMSと同一

**考察**: 2026年時点ではまだ新しいが、AWS End User Messagingが
「RCSで送り、不達ならSMSにフォールバック」を同一基盤で組めるため、
パターンB採用時の上位互換オプションとして段階導入できる。

---

## 7. コスト試算（1,600通/日 = 48,000通/月）

前提: 10DLC番号、Vetting済みブランド。固定費: 初期 $4.50 + $40 + 審査$15 ≒ **$60**、
月額固定 キャンペーン$10 + 番号$1 ≒ **$11/月**。

| シナリオ | B: AWS EUM SMS | C: Twilio | D: AWS RCS |
|---|---|---|---|
| 1通=1セグメント（絵文字なし・160字以内） | 48,000 × ~$0.009 ≒ **$430/月** | 48,000 × ~$0.012 ≒ **$580/月** | 同水準（配信成功分のみ） |
| 1通=2セグメント（絵文字あり 等） | ~**$860/月** | ~**$1,160/月** | 160字超でも1通扱いのため**増えない** |

### WhatsApp版との比較

| | WhatsApp (Utilityテンプレ) | SMS (10DLC) |
|---|---|---|
| 月額変動費（48,000通） | ~$192〜432 | ~$430〜860 |
| 文面の事前審査 | テンプレートごとに審査 | なし（キャンペーン単位の審査のみ） |
| 販促コンテンツの可否 | **米国宛てMarketing停止中** | 書面同意があれば可 |
| リーチ | WhatsAppアプリ利用者のみ（米国では限定的） | **電話番号を持つ全員に届く** |
| 規制リスク | Metaポリシー（アカウント停止） | **連邦法TCPA（$500〜1,500/通の賠償）** |

---

## 8. ユーザオンボーディング（オプトイン）設計

WhatsAppより**ユーザ側の障壁は低い**（アプリ不要・全携帯に標準搭載）が、
**運営側の同意管理義務は重い**。

### 推奨フロー（パターンB/C/D共通）

1. **入口（いずれか）**:
   - Webフォーム: 電話番号入力 + **同意チェックボックス**（販促を含むなら express written
     consent の文言。事業者名・"up to 2 msgs/day"・"Msg & data rates may apply"・
     STOP/HELP案内・利用規約/プライバシーポリシーへのリンクを明記）
   - キーワード型: 掲示物等に「Text **JOIN** to (xxx) xxx-xxxx」
2. **ダブルオプトイン**: 確認SMS「Reply YES to confirm…」→ YES返信で購読確定。
   同意の日時・経路・文言をDynamoDB等に**証跡として永続化**（TCPA訴訟対策の核心）
3. **ウェルカムメッセージ**: 頻度・STOP/HELP案内を含む初回メッセージ
4. **オプトアウト**: STOP（および合理的なバリエーション）を受信即時に配信停止。
   AWS EUM SMSはSTOP処理が組み込み
5. **10DLCキャンペーン審査との連動**: 上記オプトインフローのスクリーンショット/URLを
   キャンペーン登録時に提出する（審査要件）。**導線実装が登録より先**になる点に注意

### パターン別の差分

チャネルが同じSMS網なのでB/C/Dでユーザ体験の差はほぼない。
RCS(D)のみ、対応端末では送信者が「認証済みブランド」表示になり信頼されやすい。
Apple Messages for Business（青バブル）はユーザ起点限定のため、
「問い合わせ・サポート窓口」として将来併設する位置づけ。

---

## 9. セグメンテーション・A/Bテスト・CRM連携

### 構造はWhatsApp版と同じ「送信経路とツールの結合」問題

SMSでも電話番号は1つのプロバイダにホストされるため、
(a) エンゲージメントツールに番号ごと任せる / (b) 送信はAWSに残しCRMをセグメント源に使う /
(c) 用途別に番号を分ける、の3方式に収束する。

| ツール | SMS対応 | 800人×2通/日との相性 |
|---|---|---|
| [HubSpot Marketing SMS](https://knowledge.hubspot.com/sms/set-up-sms-messaging) | ネイティブ対応（バックエンドはTwilio、Marketing Hub Pro以上 + SMSアドオン） | アドオンが**$75/月で1,000セグメント**からの従量パッケージのため、**月48,000セグメントでは非経済的**。セグメント管理・ワークフロー用（方式b）に回すのが現実的 |
| [Braze](https://www.braze.com/docs/user_guide/message_building_by_channel/sms_mms_rcs/user_phone_numbers/10dlc) | SMS/MMS/**RCS**対応、10DLC登録も管理 | セグメント・多変量A/B・Canvasが揃う。方式(a)。エンタープライズ価格帯 |
| Customer.io | SMS対応（Twilio連携） | 行動トリガー・セグメント・A/B。中価格帯。方式(a) |
| Twilio Segment / Engage | パターンCと同一ベンダー | CDPでセグメント→Engageで配信まで一気通貫 |
| AWSネイティブ | パターンB/D | キャンペーンUIなし。DynamoDB+Lambdaで割付・配信ログを自前管理（実験統制には好適） |

### 考察

- 実証実験フェーズは**WhatsApp版と同じ結論**: AWS（パターンB）で送信・割付・ログを
  自前管理し、HubSpot等は顧客台帳・同意記録・セグメント定義として方式(b)で併用
- SMSはWhatsAppと違い文面の事前テンプレート審査がないため、**A/Bテストの文面バリエーションを
  即日入れ替えられる**のは実験運用上の明確な利点

---

## 10. 比較まとめと推奨

| | A: 非公式手段 | B: AWS EUM SMS | C: Twilio | D: RCS (AWS) | E: Apple Messages for Business |
|---|---|---|---|---|---|
| 800人×2通/日プッシュ | ✗ 遮断・規約外 | ◎ | ◎ | ◎（要フォールバック） | ✗ ユーザ起点のみ |
| 月額概算（1セグメント時） | — | ~$430 | ~$580 | 同水準 | — |
| 事前登録 | — | 10DLC（1〜4週間） | 10DLC（同左） | 10DLC + RCSエージェント審査 | Apple審査 + MSP契約 |
| リッチ表現/ブランド表示 | — | ✗ テキストのみ | ✗ | ◎ カード/ボタン/認証バッジ | ◎ |
| AWS資産との親和性 | — | **高** | 低 | **高** | 低 |

**推奨（米国CA州・800人・2通/日の前提で）:**

1. **本命はパターンB（AWS End User Messaging SMS）**。WhatsApp版で推奨した
   同一サービスファミリーのため、**WhatsAppとSMSを同じAWS基盤・同じLambda/DynamoDB設計で
   並走**でき、チャネル比較実験（WhatsApp vs SMSのナッジ反応率）すら可能になる
2. **先行タスク: オプトイン導線（Webフォーム+ダブルオプトイン+同意証跡）の実装 →
   10DLCブランド登録($4.50) + Vetting($40) + キャンペーン登録 → 番号取得**。
   登録審査に1〜4週間。Vettingは1,600通/日がT-Mobile低位枠(約2,000/日)に接触するため必須
3. **文面設計でコストが倍変わる**: 絵文字を使わず160字(GSM-7)以内 + 自社ドメイン短縮URL
4. リッチ表現が欲しくなったら**パターンD（RCS）をAWS上で追加**し、非対応端末はSMSに
   フォールバック。青バブル(iMessage)はプッシュ不可のため対象外とし、
   Apple Messages for Businessは将来のサポート窓口として別途検討
5. **法務確認を1点**: ナッジ文面が「サービス通知」か「販促」かで必要な同意レベルが
   変わる（販促なら express written consent）。エクスポージャーが大きいため
   同意文言はリーガルレビューを通すこと

---

## 参考資料

- [A2P 10DLC: 2026年のコストと登録ガイド (tuco.ai)](https://tuco.ai/a2p-10dlc)
- [10DLC Registration Guide 2026 (TXTImpact)](https://www.txtimpact.com/blog/a2p-10dlc-registration-guide)
- [10DLC Compliance / TCPA Guide (JustCall)](https://justcall.io/blog/10dlc-compliance-guide.html)
- [AWS End User Messaging Pricing](https://aws.amazon.com/end-user-messaging/pricing/)
- [AWS Docs: United States 10DLC registration](https://docs.aws.amazon.com/sms-voice/latest/userguide/registrations-10dlc.html)
- [AWS Docs: RCS billing and pricing model](https://docs.aws.amazon.com/sms-voice/latest/userguide/rcs-billing.html)
- [AWS: RCS for Business 対応発表 (2026-03)](https://aws.amazon.com/about-aws/whats-new/2026/03/rcs-business-messaging/) / [22カ国展開 (2026-05)](https://aws.amazon.com/about-aws/whats-new/2026/05/aws-rcs-countries/)
- [Apple Messages for Business REST API（ユーザ起点限定）](https://register.apple.com/resources/messages/msp-rest-api/)
- [Apple RCS: iOS対応状況 (Infobip)](https://www.infobip.com/blog/apple-rcs)
- [Apple Newsroom: E2E暗号化RCS (2026-05)](https://www.apple.com/newsroom/2026/05/end-to-end-encrypted-rcs-messaging-begins-rolling-out-today-in-beta/)
- [Twilio Messaging Pricing](https://www.twilio.com/en-us/pricing/messaging)
- [HubSpot: Set up SMS messaging](https://knowledge.hubspot.com/sms/set-up-sms-messaging)
- [Braze: A2P 10DLC](https://www.braze.com/docs/user_guide/message_building_by_channel/sms_mms_rcs/user_phone_numbers/10dlc)
