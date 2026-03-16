import type { Participant, RoundingUnit } from "@/types";

type ParticipantInput = Pick<
  Participant,
  "id" | "weight" | "fixed_amount" | "temporary_name"
> & { is_organizer?: boolean };

export interface SplitResult {
  id: string;
  calculated_amount: number;
}

export function calculateSplits(
  totalAmount: number,
  participants: ParticipantInput[],
  roundingUnit: RoundingUnit
): SplitResult[] {
  const results: SplitResult[] = [];

  // 1. fixed_amount 設定者を分離
  const fixedParticipants = participants.filter(
    (p) => p.fixed_amount !== undefined
  );
  const weightedParticipants = participants.filter(
    (p) => p.fixed_amount === undefined
  );

  // 固定合計を算出
  const fixedTotal = fixedParticipants.reduce(
    (sum, p) => sum + (p.fixed_amount ?? 0),
    0
  );

  // 2. 残額を重みで按分
  const remaining = totalAmount - fixedTotal;
  const totalWeight = weightedParticipants.reduce(
    (sum, p) => sum + p.weight,
    0
  );

  // fixed_amount 参加者の結果を追加
  for (const p of fixedParticipants) {
    results.push({ id: p.id, calculated_amount: p.fixed_amount! });
  }

  // 3. 丸め処理
  let roundedTotal = 0;
  const weightedResults: SplitResult[] = [];

  for (const p of weightedParticipants) {
    const raw = (remaining * p.weight) / totalWeight;
    const rounded = Math.round(raw / roundingUnit) * roundingUnit;
    weightedResults.push({ id: p.id, calculated_amount: rounded });
    roundedTotal += rounded;
  }

  // 4. 丸め誤差を幹事で調整
  const diff = totalAmount - fixedTotal - roundedTotal;
  const organizer =
    weightedParticipants.find((p) => p.is_organizer) ??
    weightedParticipants[0];

  for (const r of weightedResults) {
    if (r.id === organizer?.id) {
      r.calculated_amount += diff;
    }
    results.push(r);
  }

  return results;
}
