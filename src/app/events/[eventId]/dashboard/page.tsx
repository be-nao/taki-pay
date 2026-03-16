import { notFound } from "next/navigation";
import { getEvent } from "@/lib/firestore/events";
import { getParticipantsByEvent } from "@/lib/firestore/participants";
import { getPaymentClaimsByEvent } from "@/lib/firestore/payment_claims";
import { DashboardClient } from "./DashboardClient";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { eventId } = await params;

  const event = await getEvent(eventId);
  if (!event) notFound();

  const participants = await getParticipantsByEvent(eventId);
  const claims = await getPaymentClaimsByEvent(participants.map((p) => p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              SplitPay
            </h1>
            <p className="text-xs text-gray-500">{event.title}</p>
          </div>
          <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            管理ダッシュボード
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <DashboardClient
          eventId={eventId}
          event={event}
          initialParticipants={participants}
          initialClaims={claims}
        />
      </main>
    </div>
  );
}
