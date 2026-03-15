# UI/UX 仕様: コンポーネントと画面構成

## 1. デザインガイドライン

- **Theme:** PayPay Red (`#ff0033`), Success Green (`#00c543`), Background (`#f8fafc`)
- **Components:** shadcn/ui をベースに、`rounded-xl` (12px) を多用したカード型UI。

## 2. 各画面の構成パーツ

### 幹事：イベント作成 (`/events/new`)

- `EventBasicForm`: タイトル、総額、丸め単位。
- `ParticipantDynamicList`: 名前、重み(Select)、計算済み金額(ReadOnly)の動的リスト。
- `PayPayLinkInput`: マイコードURLのバリデーションと貼り付け機能。

### 参加者：支払い画面 (`/pay/[eventId]/[participantId]`)

- `EventHeroCard`: 支払額を `text-4xl` で強調。
- `PayPayActionStep`:
  - ボタン1: 金額コピー & PayPayアプリ起動 (`window.location.href`)。
  - ボタン2: 送金報告。

### 幹事：ダッシュボード (`/events/[eventId]/dashboard`)

- `ProgressHeader`: 回収率のプログレスバー。
- `MemberStatusList`: 状態に応じたバッジ（未払/報告済/承認済）と、承認/催促アクション。
