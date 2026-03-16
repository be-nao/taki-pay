"use client";

import React from "react";
import { Trash2, Plus, ChevronRight } from "lucide-react";
import type { ParticipantRow } from "../_types";
import { WEIGHT_MIN, WEIGHT_MAX, WEIGHT_STEP } from "../_types";
import type { RoundingUnit } from "@/types";

interface Props {
  participants: ParticipantRow[];
  roundingUnit: RoundingUnit;
  paypayUrl: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: "name" | "weight", value: string | number) => void;
  onRoundingUnitChange: (unit: RoundingUnit) => void;
  onPaypayUrlChange: (url: string) => void;
  onNext: () => void;
}

export function ParticipantsTab({
  participants,
  roundingUnit,
  paypayUrl,
  onAdd,
  onRemove,
  onChange,
  onRoundingUnitChange,
  onPaypayUrlChange,
  onNext,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {participants.map((p) => (
          <div key={p.id} className="card-modern p-3 group hover:scale-[1.01] transition-all duration-300 relative">
            <button
              className="absolute top-2 right-2 sm:hidden btn-danger"
              onClick={() => !p.isOrganizer && onRemove(p.id)}
            >
              {!p.isOrganizer && <Trash2 className="w-4 h-4" />}
            </button>
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="w-32 space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                    {p.isOrganizer ? "幹事名" : "参加者名"}
                  </label>
                  <input
                    type="text"
                    placeholder={p.isOrganizer ? "幹事の名前" : "参加者の名前"}
                    value={p.name}
                    onChange={(e) => onChange(p.id, "name", e.target.value)}
                    className="input-modern py-3 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">
                    傾斜
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onChange(p.id, "weight", Math.max(WEIGHT_MIN, p.weight - 5))}
                      className="w-8 h-8 rounded-lg border-2 border-slate-300 bg-white text-slate-600 font-bold hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={WEIGHT_MIN}
                      max={WEIGHT_MAX}
                      step={WEIGHT_STEP}
                      value={p.weight}
                      onChange={(e) => {
                        const v = Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, Number(e.target.value)));
                        onChange(p.id, "weight", v);
                      }}
                      className="w-14 rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 transition-all"
                    />
                    <span className="text-sm text-slate-500 font-medium">%</span>
                    <button
                      onClick={() => onChange(p.id, "weight", Math.min(WEIGHT_MAX, p.weight + 5))}
                      className="w-8 h-8 rounded-lg border-2 border-slate-300 bg-white text-slate-600 font-bold hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center justify-center"
                    >
                      ＋
                    </button>
                  </div>
                </div>
                {!p.isOrganizer && (
                  <button
                    className="hidden sm:flex btn-danger flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pb-1"
                    onClick={() => onRemove(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  step={WEIGHT_STEP}
                  value={p.weight}
                  onChange={(e) => onChange(p.id, "weight", Number(e.target.value))}
                  className="slider-weight"
                  style={{ "--ratio": (p.weight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN) } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{WEIGHT_MIN}%</span>
                  <span>{WEIGHT_MAX}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <button onClick={onAdd} className="btn-primary group flex items-center px-6 py-3">
          <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          参加者を追加
        </button>
      </div>

      <div className="card-modern p-4 sm:p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 tracking-wide">
            PayPay マイコードURL <span className="text-gray-400 text-xs">（任意）</span>
          </label>
          <input
            type="url"
            placeholder="https://qr.paypay.ne.jp/..."
            value={paypayUrl}
            onChange={(e) => onPaypayUrlChange(e.target.value)}
            className="input-modern"
          />
          <p className="text-xs text-gray-400">PayPayアプリ → 受け取る → URLをコピー</p>
        </div>
      </div>

      <div className="card-modern p-4 sm:p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 tracking-wide">丸め単位</label>
          <div className="flex gap-2">
            {([100, 500] as RoundingUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => onRoundingUnitChange(u)}
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
        onClick={onNext}
        className="btn-primary w-full flex items-center justify-center py-3 text-base"
      >
        傾斜計算する
        <ChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}
