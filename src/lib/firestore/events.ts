import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/types";

const col = () => collection(db, "events");

export async function createEvent(
  data: Omit<Event, "id">
): Promise<string> {
  const ref = await addDoc(col(), data);
  return ref.id;
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Event;
}

export async function updateEventStatus(
  eventId: string,
  status: Event["status"]
): Promise<void> {
  await updateDoc(doc(db, "events", eventId), { status });
}
