"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { calculateSplits } from "@/lib/splitCalc";
import { createEvent } from "@/lib/firestore/events";
import { addParticipant } from "@/lib/firestore/participants";
import type { RoundingUnit } from "@/types";
import { Trash2, Plus, ChevronRight } from "lucide-react";

// --- 型定義 ---
interface PlanRow {
  id: string;
  name: string;
  amount: string;
}

interface ParticipantRow {
  id: string;
  name: string;
  weight: number;
  calculatedAmount: number;
  isOrganizer: boolean;
}

type Tab = "plan" | "participants" | "calculate";

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

// --- メインページ ---
export default function NewEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("plan");

  // お会計タブ
  const [plans, setPlans] = useState<PlanRow[]>([
    { id: nanoid(), name: "", amount: "" },
  ]);

  // 参加者タブ
  const [participants, setParticipants] = useState<ParticipantRow[]>([
    { id: nanoid(), name: "", weight: 1, calculatedAmount: 0, isOrganizer: true },
  ]);
  const [roundingUnit, setRoundingUnit] = useState<RoundingUnit>(100);
  const [paypayUrl, setPaypayUrl] = useState("");

  // 傾斜計算タブ
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = plans.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // --- 計算 ---
  const recalculate = useCallback(
    (rows: ParticipantRow[], total: number, unit: RoundingUnit) => {
      if (!total || rows.length === 0) return rows.map((r) => ({ ...r, calculatedAmount: 0 }));
      const inputs = rows.map((r) => ({
        id: r.id,
        weight: r.weight,
        temporary_name: r.name,
        is_organizer: r.isOrganizer,
      }));
      const results = calculateSplits(total, inputs, unit);
      return rows.map((r) => ({
        ...r,
        calculatedAmount: results.find((res) => res.id === r.id)?.calculated_amount ?? 0,
      }));
    },
    []
  );

  // --- プラン操作 ---
  const addPlan = () => setPlans((p) => [...p, { id: nanoid(), name: "", amount: "" }]);
  const removePlan = (id: string) => setPlans((p) => p.filter((r) => r.id !== id));
  const updatePlan = (id: string, field: keyof PlanRow, value: string) =>
    setPlans((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // --- 参加者操作 ---
  const addParticipantRow = () => {
    setParticipants((prev) => {
      const updated = [...prev, { id: nanoid(), name: "", weight: 1, calculatedAmount: 0, isOrganizer: false }];
      return recalculate(updated, totalAmount, roundingUnit);
    });
  };
  const removeParticipantRow = (id: string) => {
    setParticipants((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      return recalculate(updated, totalAmount, roundingUnit);
    });
  };
  const updateParticipant = (id: string, field: "name" | "weight", value: string | number) => {
    setParticipants((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, [field]: value } : r));
      return recalculate(updated, totalAmount, roundingUnit);
    });
  };

  // --- 保存 ---
  const handleSubmit = async () => {
    if (!totalAmount || participants.some((p) => !p.name)) return;
    setSubmitting(true);
    try {
      const eventTitle = plans.map((p) => p.name).filter(Boolean).join("・") || "割り勘イベント";
      const eventId = await createEvent({
        organizer_id: "anonymous",
        title: eventTitle,
        total_amount: totalAmount,
        rounding_unit: roundingUnit,
        status: "open",
        ...(paypayUrl ? { paypay_qr_url: paypayUrl } : {}),
      } as Parameters<typeof createEvent>[0]);

      const recalculated = recalculate(participants, totalAmount, roundingUnit);
      for (const p of recalculated) {
        const data: Parameters<typeof addParticipant>[0] = {
          event_id: eventId,
          temporary_name: p.name,
          weight: p.weight,
          calculated_amount: p.calculatedAmount,
        };
        await addParticipant(data);
      }
      router.push(`/events/${eventId}/dashboard`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- タブごとのコンテンツ ---
  const tabs: { key: Tab; label: string }[] = [
    { key: "plan", label: "お会計" },
    { key: "participants", label: "参加者" },
    { key: "calculate", label: "傾斜計算" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* モバイル */}
          <div className="flex items-center justify-between py-3 sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <div className="flex space-x-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`py-1.5 px-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeTab === t.key ? "tab-active" : "tab-inactive"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* デスクトップ */}
          <div className="hidden sm:flex items-center justify-center py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <p className="ml-3 text-sm text-gray-500">傾斜割り勘 + PayPay送金</p>
          </div>
        </div>
      </header>

      {/* タブナビゲーション（デスクトップ） */}
      <div className="max-w-3xl mx-auto px-4 pt-4 hidden sm:block">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          <div className="flex space-x-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-3 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === t.key ? "tab-active" : "tab-inactive"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        <div className="animate-fade-in">

          {/* ── お会計タブ ── */}
          {activeTab === "plan" && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {plans.map((plan, i) => (
                  <div key={plan.id} className="card-modern p-4 sm:p-6 group hover:scale-[1.01] transition-all duration-300 relative">
                    <button
                      className="absolute top-2 right-2 sm:hidden btn-danger"
                      onClick={() => removePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            プラン名
                          </label>
                          <input
                            type="text"
                            placeholder="例: 1次会、懇親会"
                            value={plan.name}
                            onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                            className="input-modern"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            金額
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="0"
                              min={0}
                              value={plan.amount}
                              onChange={(e) => updatePlan(plan.id, "amount", e.target.value)}
                              className="input-modern pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                              円
                            </span>
                          </div>
                        </div>
                      </div>
                      {i > 0 && (
                        <button
                          className="hidden sm:flex btn-danger flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePlan(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 追加ボタン */}
              <div className="flex flex-col items-center">
                <button onClick={addPlan} className="btn-primary group flex items-center px-6 py-3">
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  新しい会計を追加
                </button>
              </div>

              {/* 合計金額 */}
              <div className="card-modern p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">合計金額</h3>
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ¥{totalAmount.toLocaleString()}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {plans.length}つのプランの合計
                  </p>
                </div>
              </div>

              {/* 次へ */}
              <button
                onClick={() => setActiveTab("participants")}
                className="btn-primary w-full flex items-center justify-center py-3 text-base"
              >
                参加者を設定する
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}

          {/* ── 参加者タブ ── */}
          {activeTab === "participants" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {participants.map((p) => (
                  <div key={p.id} className="card-modern p-4 group hover:scale-[1.01] transition-all duration-300 relative">
                    <button
                      className="absolute top-2 right-2 sm:hidden btn-danger"
                      onClick={() => !p.isOrganizer && removeParticipantRow(p.id)}
                    >
                      {!p.isOrganizer && <Trash2 className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            {p.isOrganizer ? "幹事名" : "参加者名"}
                          </label>
                          <input
                            type="text"
                            placeholder={p.isOrganizer ? "幹事の名前" : "参加者の名前"}
                            value={p.name}
                            onChange={(e) => updateParticipant(p.id, "name", e.target.value)}
                            className="input-modern"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            傾斜
                          </label>
                          <select
                            value={p.weight}
                            onChange={(e) => updateParticipant(p.id, "weight", Number(e.target.value))}
                            className="input-modern"
                          >
                            {WEIGHT_OPTIONS.map((w) => (
                              <option key={w} value={w}>{w}倍</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!p.isOrganizer && (
                        <button
                          className="hidden sm:flex btn-danger flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeParticipantRow(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center">
                <button onClick={addParticipantRow} className="btn-primary group flex items-center px-6 py-3">
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  参加者を追加
                </button>
              </div>

              {/* PayPay URL */}
              <div className="card-modern p-4 sm:p-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-600">
                    PayPay マイコードURL <span className="text-gray-400 text-xs">（任意）</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://qr.paypay.ne.jp/..."
                    value={paypayUrl}
                    onChange={(e) => setPaypayUrl(e.target.value)}
                    className="input-modern"
                  />
                  <p className="text-xs text-gray-400">PayPayアプリ → 受け取る → URLをコピー</p>
                </div>
              </div>

              {/* 丸め単位 */}
              <div className="card-modern p-4 sm:p-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-600">丸め単位</label>
                  <div className="flex gap-2">
                    {([100, 500] as RoundingUnit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setRoundingUnit(u);
                          setParticipants((prev) => recalculate(prev, totalAmount, u));
                        }}
                        className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                          roundingUnit === u
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md"
                            : "bg-white border border-slate-200 text-gray-600 hover:border-emerald-300"
                        }`}
                      >
                        {u}円単位
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setParticipants((prev) => recalculate(prev, totalAmount, roundingUnit));
                  setActiveTab("calculate");
                }}
                className="btn-primary w-full flex items-center justify-center py-3 text-base"
              >
                傾斜計算する
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}

          {/* ── 傾斜計算タブ ── */}
          {activeTab === "calculate" && (
            <div className="space-y-4">
              {/* 合計 */}
              <div className="card-modern p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-center">
                <p className="text-sm text-gray-600 mb-1">合計金額</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ¥{totalAmount.toLocaleString()}
                </p>
              </div>

              {/* 各参加者の金額 */}
              <div className="grid gap-3">
                {participants.map((p) => (
                  <div key={p.id} className="card-modern p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{p.name || "（名前未入力）"}</p>
                      <p className="text-xs text-gray-500">傾斜 {p.weight}倍{p.isOrganizer ? " · 幹事" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ¥{p.calculatedAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PayPay送金ボタン */}
              <div className="card-modern p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 text-center">
                  各参加者に送金リンクを発行
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !totalAmount || participants.some((p) => !p.name)}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "作成中..." : "イベントを作成してURLを発行"}
                  {!submitting && <ChevronRight className="w-5 h-5 ml-1" />}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  各参加者専用のPayPay送金リンクが発行されます
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
