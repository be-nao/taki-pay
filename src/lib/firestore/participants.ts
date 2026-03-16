import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Participant } from "@/types";

export async function addParticipant(
  data: Omit<Participant, "id">
): Promise<string> {
  // Firestoreはundefinedフィールドを拒否するため除去する
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, "participants"), clean);
  return ref.id;
}

export async function getParticipant(
  participantId: string
): Promise<Participant | null> {
  const snap = await getDoc(doc(db, "participants", participantId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Participant;
}

export async function getParticipantsByEvent(
  eventId: string
): Promise<Participant[]> {
  const q = query(
    collection(db, "participants"),
    where("event_id", "==", eventId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Participant));
}

export async function updateParticipantAmount(
  participantId: string,
  calculated_amount: number
): Promise<void> {
  await updateDoc(doc(db, "participants", participantId), { calculated_amount });
}
