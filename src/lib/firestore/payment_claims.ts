import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PaymentClaim } from "@/types";

export async function createPaymentClaim(
  participantId: string
): Promise<string> {
  const ref = await addDoc(collection(db, "payment_claims"), {
    participant_id: participantId,
    status: "reported",
    reported_at: serverTimestamp(),
  });
  return ref.id;
}

export async function getPaymentClaimsByEvent(
  participantIds: string[]
): Promise<PaymentClaim[]> {
  if (participantIds.length === 0) return [];
  const q = query(
    collection(db, "payment_claims"),
    where("participant_id", "in", participantIds)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentClaim));
}

export async function verifyPaymentClaim(claimId: string): Promise<void> {
  await updateDoc(doc(db, "payment_claims", claimId), { status: "verified" });
}
