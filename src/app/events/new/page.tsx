"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { calculateSplits } from "@/lib/splitCalc";
import { createEvent } from "@/lib/firestore/events";
import { addParticipant } from "@/lib/firestore/participants";
import type { RoundingUnit } from "@/types";
import { PlanTab } from "./_components/PlanTab";
import { ParticipantsTab } from "./_components/ParticipantsTab";
import { CalculateTab } from "./_components/CalculateTab";
import type { PlanRow, ParticipantRow, Tab } from "./_types";
import { WEIGHT_DEFAULT } from "./_types";

const TABS: { key: Tab; label: string; step: number }[] = [
  { key: "plan", label: "お会計", step: 1 },
  { key: "participants", label: "参加者", step: 2 },
  { key: "calculate", label: "傾斜計算", step: 3 },
];

export default function NewEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [plans, setPlans] = useState<PlanRow[]>([{ id: nanoid(), name: "", amount: "" }]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([
    { id: nanoid(), name: "", weight: WEIGHT_DEFAULT, calculatedAmount: 0, isOrganizer: true },
  ]);
  const [roundingUnit, setRoundingUnit] = useState<RoundingUnit>(100);
  const [paypayUrl, setPaypayUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = plans.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const recalculate = useCallback((rows: ParticipantRow[], total: number, unit: RoundingUnit) => {
    if (!total || rows.length === 0) return rows.map((r) => ({ ...r, calculatedAmount: 0 }));
    const results = calculateSplits(
      total,
      rows.map((r) => ({ id: r.id, weight: r.weight, temporary_name: r.name, is_organizer: r.isOrganizer })),
      unit
    );
    return rows.map((r) => ({
      ...r,
      calculatedAmount: results.find((res) => res.id === r.id)?.calculated_amount ?? 0,
    }));
  }, []);

  // --- プラン操作 ---
  const addPlan = () => setPlans((p) => [...p, { id: nanoid(), name: "", amount: "" }]);
  const removePlan = (id: string) => setPlans((p) => p.filter((r) => r.id !== id));
  const updatePlan = (id: string, field: keyof PlanRow, value: string) =>
    setPlans((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // --- 参加者操作 ---
  const addParticipantRow = () =>
    setParticipants((prev) =>
      recalculate([...prev, { id: nanoid(), name: "", weight: WEIGHT_DEFAULT, calculatedAmount: 0, isOrganizer: false }], totalAmount, roundingUnit)
    );
  const removeParticipantRow = (id: string) =>
    setParticipants((prev) => recalculate(prev.filter((r) => r.id !== id), totalAmount, roundingUnit));
  const updateParticipant = (id: string, field: "name" | "weight", value: string | number) =>
    setParticipants((prev) => recalculate(prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)), totalAmount, roundingUnit));

  const handleRoundingUnitChange = (unit: RoundingUnit) => {
    setRoundingUnit(unit);
    setParticipants((prev) => recalculate(prev, totalAmount, unit));
  };

  // --- 保存 ---
  const handleSubmit = async () => {
    if (!totalAmount || participants.some((p) => !p.name)) return;
    setSubmitting(true);
    try {
      console.log("[submit] start");
      const eventTitle = plans.map((p) => p.name).filter(Boolean).join("・") || "割り勘イベント";
      console.log("[submit] createEvent...");
      const eventId = await createEvent({
        organizer_id: "anonymous",
        title: eventTitle,
        total_amount: totalAmount,
        rounding_unit: roundingUnit,
        status: "open",
        ...(paypayUrl ? { paypay_qr_url: paypayUrl } : {}),
      } as Parameters<typeof createEvent>[0]);
      console.log("[submit] eventId:", eventId);

      for (const p of recalculate(participants, totalAmount, roundingUnit)) {
        console.log("[submit] addParticipant:", p.name);
        await addParticipant({ event_id: eventId, temporary_name: p.name, weight: p.weight, calculated_amount: p.calculatedAmount });
      }
      console.log("[submit] done, redirecting...");
      router.push(`/events/${eventId}/dashboard`);
    } catch (e) {
      console.error("[submit] error:", e);
      alert(`エラーが発生しました: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* モバイル */}
          <div className="flex items-center justify-between py-3 sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <div className="flex space-x-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`py-1.5 px-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === t.key
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span className={`mr-1 text-xs ${activeTab === t.key ? "text-white/70" : "text-gray-300"}`}>
                    {t.step}.
                  </span>
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
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-3 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === t.key
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className={`mr-1 text-xs ${activeTab === t.key ? "text-white/70" : "text-gray-300"}`}>
                  {t.step}.
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        <div className="animate-fade-in">
          {activeTab === "plan" && (
            <PlanTab
              plans={plans}
              totalAmount={totalAmount}
              onAdd={addPlan}
              onRemove={removePlan}
              onChange={updatePlan}
              onNext={() => setActiveTab("participants")}
            />
          )}
          {activeTab === "participants" && (
            <ParticipantsTab
              participants={participants}
              roundingUnit={roundingUnit}
              paypayUrl={paypayUrl}
              onAdd={addParticipantRow}
              onRemove={removeParticipantRow}
              onChange={updateParticipant}
              onRoundingUnitChange={handleRoundingUnitChange}
              onPaypayUrlChange={setPaypayUrl}
              onNext={() => {
                setParticipants((prev) => recalculate(prev, totalAmount, roundingUnit));
                setActiveTab("calculate");
              }}
            />
          )}
          {activeTab === "calculate" && (
            <CalculateTab
              participants={participants}
              totalAmount={totalAmount}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
