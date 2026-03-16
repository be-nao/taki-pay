"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Bell } from "lucide-react";
import { verifyPaymentClaim } from "@/lib/firestore/payment_claims";
import type { Event, Participant, PaymentClaim, PaymentStatus } from "@/types";

interface Props {
  eventId: string;
  event: Event;
  initialParticipants: Participant[];
  initialClaims: PaymentClaim[];
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "未払い",
  reported: "報告済み",
  verified: "承認済み",
};

const STATUS_COLOR: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-600",
  reported: "bg-amber-100 text-amber-600",
  verified: "bg-emerald-100 text-emerald-600",
};

export function DashboardClient({ eventId, event, initialParticipants, initialClaims }: Props) {
  const [claims, setClaims] = useState<PaymentClaim[]>(initialClaims);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getStatus = (participantId: string): PaymentStatus =>
    claims.find((c) => c.participant_id === participantId)?.status ?? "unpaid";

  const getClaim = (participantId: string) =>
    claims.find((c) => c.participant_id === participantId);

  const verified = initialParticipants.filter((p) => getStatus(p.id) === "verified").length;
  const rate = initialParticipants.length === 0 ? 0 : Math.round((verified / initialParticipants.length) * 100);
  const collectedAmount = initialParticipants
    .filter((p) => getStatus(p.id) === "verified")
    .reduce((sum, p) => sum + p.calculated_amount, 0);

  const handleVerify = async (claimId: string) => {
    setVerifying(claimId);
    try {
      await verifyPaymentClaim(claimId);
      setClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, status: "verified" } : c)));
    } finally {
      setVerifying(null);
    }
  };

  const copyPayUrl = (participantId: string) => {
    const url = `${window.location.origin}/pay/${eventId}/${participantId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(participantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 回収状況サマリー */}
      <div className="card-modern p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">回収率</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {rate}%
            </p>
          </div>
          <p className="text-sm text-gray-500">{verified} / {initialParticipants.length} 人 承認済み</p>
        </div>
        {/* プログレスバー */}
        <div className="w-full bg-white/60 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="text-right text-sm text-gray-500 mt-1">
          ¥{collectedAmount.toLocaleString()} / ¥{event.total_amount.toLocaleString()}
        </p>
      </div>

      {/* 参加者リスト */}
      <div className="grid gap-3">
        {initialParticipants.map((p) => {
          const status = getStatus(p.id);
          const claim = getClaim(p.id);
          return (
            <div key={p.id} className="card-modern p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{p.temporary_name}</p>
                <p className="text-sm text-gray-500">¥{p.calculated_amount.toLocaleString()}</p>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[status]}`}>
                {STATUS_LABEL[status]}
              </span>

              {status === "reported" && claim && (
                <button
                  onClick={() => handleVerify(claim.id)}
                  disabled={verifying === claim.id}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  承認
                </button>
              )}

              {status === "unpaid" && (
                <button
                  onClick={() => copyPayUrl(p.id)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition-all"
                >
                  {copiedId === p.id ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" />コピー済み</>
                  ) : (
                    <><Copy className="w-4 h-4" />URLコピー</>
                  )}
                </button>
              )}

              {status === "verified" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* 使い方ガイド */}
      <div className="card-modern p-4 bg-white/40">
        <p className="text-xs font-semibold text-gray-500 mb-2">使い方</p>
        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>「URLコピー」で参加者専用リンクをコピーしてLINEでシェア</span>
          </div>
          <div className="flex items-start gap-2">
            <Bell className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>参加者がPayPay送金後に「報告」ボタンを押すと「報告済み」になります</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
            <span>着金を確認したら「承認」ボタンを押してください</span>
          </div>
        </div>
      </div>
    </div>
  );
}
