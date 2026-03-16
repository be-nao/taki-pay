"use client";

import { ChevronRight } from "lucide-react";
import type { ParticipantRow } from "../_types";

interface Props {
  participants: ParticipantRow[];
  totalAmount: number;
  submitting: boolean;
  onSubmit: () => void;
}

export function CalculateTab({ participants, totalAmount, submitting, onSubmit }: Props) {
  const canSubmit = !submitting && totalAmount > 0 && participants.every((p) => p.name);

  return (
    <div className="space-y-4">
      <div className="card-modern p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-center">
        <p className="text-sm text-gray-600 mb-1">合計金額</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          ¥{totalAmount.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-3">
        {participants.map((p) => (
          <div key={p.id} className="card-modern p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{p.name || "（名前未入力）"}</p>
              <p className="text-xs text-gray-500">
                傾斜 {p.weight}%{p.isOrganizer ? " · 幹事" : ""}
              </p>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ¥{p.calculatedAmount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="card-modern p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 text-center">
          各参加者に送金リンクを発行
        </p>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
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
  );
}
