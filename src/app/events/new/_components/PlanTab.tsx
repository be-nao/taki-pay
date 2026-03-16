"use client";

import { Trash2, Plus, ChevronRight } from "lucide-react";
import type { PlanRow } from "../_types";

interface Props {
  plans: PlanRow[];
  totalAmount: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof PlanRow, value: string) => void;
  onNext: () => void;
}

export function PlanTab({ plans, totalAmount, onAdd, onRemove, onChange, onNext }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {plans.map((plan, i) => (
          <div key={plan.id} className="card-modern p-4 sm:p-6 group hover:scale-[1.01] transition-all duration-300 relative">
            <button
              className="absolute top-2 right-2 sm:hidden btn-danger"
              onClick={() => onRemove(plan.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                    プラン名
                  </label>
                  <input
                    type="text"
                    placeholder="例: 1次会、懇親会"
                    value={plan.name}
                    onChange={(e) => onChange(plan.id, "name", e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">
                    金額
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      min={0}
                      value={plan.amount}
                      onChange={(e) => onChange(plan.id, "amount", e.target.value)}
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
                  onClick={() => onRemove(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <button onClick={onAdd} className="btn-primary group flex items-center px-6 py-3">
          <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          新しい会計を追加
        </button>
      </div>

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

      <button
        onClick={onNext}
        className="btn-primary w-full flex items-center justify-center py-3 text-base"
      >
        参加者を設定する
        <ChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}
