import { notFound } from "next/navigation";
import { getEvent } from "@/lib/firestore/events";
import { getParticipant } from "@/lib/firestore/participants";
import { getPaymentClaimsByEvent } from "@/lib/firestore/payment_claims";
import { PayClient } from "./PayClient";

interface Props {
  params: Promise<{ eventId: string; participantId: string }>;
}

export default async function PayPage({ params }: Props) {
  const { eventId, participantId } = await params;

  const [event, participant] = await Promise.all([
    getEvent(eventId),
    getParticipant(participantId),
  ]);

  if (!event || !participant) notFound();

  const claims = await getPaymentClaimsByEvent([participantId]);
  const claim = claims[0];
  const alreadyReported = claim?.status === "reported" || claim?.status === "verified";
  const paypayQrUrl = ((event as unknown) as Record<string, unknown>).paypay_qr_url as string ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            SplitPay
          </h1>
          <p className="text-xs text-gray-500">{event.title}</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <PayClient
          eventTitle={event.title}
          participantName={participant.temporary_name}
          amount={participant.calculated_amount}
          paypayQrUrl={paypayQrUrl}
          participantId={participantId}
          alreadyReported={alreadyReported}
        />
      </main>
    </div>
  );
}
