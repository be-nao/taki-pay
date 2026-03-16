import { NextResponse } from "next/server";
import { createEvent } from "@/lib/firestore/events";
import { addParticipant } from "@/lib/firestore/participants";

export async function GET() {
  const eventId = await createEvent({
    organizer_id: "test",
    title: "テスト送金",
    total_amount: 2000,
    rounding_unit: 100,
    status: "open",
    paypay_qr_url: "https://qr.paypay.ne.jp/p2p01_x2kDSbDq7oMIhxB7",
  } as Parameters<typeof createEvent>[0]);

  const participantId = await addParticipant({
    event_id: eventId,
    temporary_name: "テストユーザー",
    weight: 100,
    calculated_amount: 2000,
  });

  const payUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/pay/${eventId}/${participantId}`;

  return NextResponse.json({ payUrl });
}
