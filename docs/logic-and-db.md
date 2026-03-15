# 技術仕様: ロジックとDB設計

## 1. データベーススキーマ (Firestore)

- **users:** `id, display_name, paypay_display_name, paypay_qr_url, created_at`
- **events:** `id, organizer_id, title, total_amount, rounding_unit(100/500), status`
- **participants:** `id, event_id, user_id(opt), temporary_name, weight(number), fixed_amount(opt), calculated_amount`
- **payment_claims:** `id, participant_id, status(unpaid/reported/verified), reported_at`

## 2. 傾斜配分アルゴリズム

- `calculateSplits(totalAmount, participants, roundingUnit)`
  1. `fixed_amount` 設定者を除外して残額を算出。
  2. 残額を残りの `weight` 合計で按分。
  3. `rounding_unit` に基づき丸め処理。
  4. 丸めによる誤差（数円〜数十円）は幹事（`organizer`）の金額で自動調整し、総計を `totalAmount` に完全一致させる。
