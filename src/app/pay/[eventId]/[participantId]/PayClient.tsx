"use client";

import { useState } from "react";
import { Send, ExternalLink, CheckCheck } from "lucide-react";
import { createPaymentClaim } from "@/lib/firestore/payment_claims";

interface Props {
  eventTitle: string;
  participantName: string;
  amount: number;
  paypayQrUrl: string;
  participantId: string;
  alreadyReported: boolean;
}

export function PayClient({ eventTitle, participantName, amount, paypayQrUrl, participantId, alreadyReported }: Props) {
  const [reported, setReported] = useState(alreadyReported);
  const [reporting, setReporting] = useState(false);

  const handlePayPay = () => {
    if (paypayQrUrl) {
      window.location.href = paypayQrUrl;
    }
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      await createPaymentClaim(participantId);
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 金額カード */}
      <div className="card-modern overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-4">
          <p className="text-white/80 text-sm">{eventTitle}</p>
          <p className="text-white font-bold text-lg">{participantName} さんの支払額</p>
        </div>
        <div className="py-8 text-center">
          <p className="text-gray-500 text-sm mb-1">お支払い金額</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ¥{amount.toLocaleString()}
          </p>
          <p className="text-gray-400 text-xs mt-3">上記の金額をPayPayで送金してください</p>
        </div>
      </div>

      {/* 操作カード */}
      <div className="card-modern p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-600 text-center">
          STEP 1 → STEP 2 の順に操作してください
        </p>

        {/* STEP 1 */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 tracking-wider">STEP 1</p>
          <button
            onClick={handlePayPay}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            PayPayを開いて送金する
          </button>
          <p className="text-xs text-gray-400 text-center">
            PayPayが開いたら <span className="font-bold text-slate-600">¥{amount.toLocaleString()}</span> を入力してください
          </p>
        </div>

        {/* STEP 2 */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 tracking-wider">STEP 2</p>
          <button
            onClick={handleReport}
            disabled={reported || reporting}
            className={`w-full py-4 text-base flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ${
              reported
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                : "bg-white border border-slate-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm disabled:opacity-50"
            }`}
          >
            {reported ? (
              <><CheckCheck className="w-5 h-5" />送金を報告済みです</>
            ) : (
              <><Send className="w-5 h-5" />{reporting ? "報告中..." : "送金完了を報告する"}</>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center px-4">
        PayPay送金後に「送金完了を報告する」を押してください。幹事が着金を確認して承認します。
      </p>
    </div>
  );
}
