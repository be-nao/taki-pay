import { Timestamp } from "firebase/firestore";

export type RoundingUnit = 100 | 500;
export type EventStatus = "open" | "closed";
export type PaymentStatus = "unpaid" | "reported" | "verified";

export interface User {
  id: string;
  display_name: string;
  paypay_display_name: string;
  paypay_qr_url: string;
  created_at: Timestamp;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  total_amount: number;
  rounding_unit: RoundingUnit;
  status: EventStatus;
}

export interface Participant {
  id: string;
  event_id: string;
  user_id?: string;
  temporary_name: string;
  weight: number;
  fixed_amount?: number;
  calculated_amount: number;
}

export interface PaymentClaim {
  id: string;
  participant_id: string;
  status: PaymentStatus;
  reported_at?: Timestamp;
}
