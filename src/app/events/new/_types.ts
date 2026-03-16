export interface PlanRow {
  id: string;
  name: string;
  amount: string;
}

export interface ParticipantRow {
  id: string;
  name: string;
  weight: number;
  calculatedAmount: number;
  isOrganizer: boolean;
}

export type Tab = "plan" | "participants" | "calculate";

export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 100;
export const WEIGHT_STEP = 1;
export const WEIGHT_DEFAULT = 50;
