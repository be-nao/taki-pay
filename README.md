# SplitPay プロジェクト・マスター指示書

## プロジェクト概要

PayPay送金誘導と傾斜計算に特化した、ログイン不要（URLベース）の割り勘Webアプリ。

## 技術スタック (Technology Stack)

AIは以下の構成に従ってプロジェクトを初期化・実装してください。

### Frontend

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **State Management:** TanStack Query

### Backend / Infrastructure

- **BaaS:** Firebase
  - **Firestore:** ドキュメント型データベース (スキーマは docs/logic-and-db.md 参照)
  - **Authentication:** LINE Login (via NextAuth.js / Auth.js)
  - **Hosting:** Firebase Hosting または Vercel

### Development Tools

- **Linter/Formatter:** ESLint, Prettier
- **Testing:** Vitest (ロジックテスト用)
- **Package Manager:** npm または pnpm

## 開発ステップと参照ファイル

1. **Step 1: ロジックとDB基盤の実装**
   - 参照: `docs/logic-and-db.md`
2. **Step 2: コンポーネントとUIの実装**
   - 参照: `docs/ui-components.md`
3. **Step 3: 外部連携とUXの高度化**
   - 内容: LINEログイン、PWA対応、PayPay起動処理の最適化。

## 指示

まずは `docs/logic-and-db.md` を読み込み、プロジェクト構造の提案から開始してください。
