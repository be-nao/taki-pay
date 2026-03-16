"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoundingUnit } from "@/types";

interface Props {
  title: string;
  totalAmount: string;
  roundingUnit: RoundingUnit;
  onChange: (field: "title" | "totalAmount" | "roundingUnit", value: string) => void;
}

export function EventBasicForm({ title, totalAmount, roundingUnit, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">イベント名</Label>
        <Input
          id="title"
          placeholder="例: 飲み会 3/15"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="totalAmount">合計金額 (円)</Label>
        <Input
          id="totalAmount"
          type="number"
          min={0}
          placeholder="例: 15000"
          value={totalAmount}
          onChange={(e) => onChange("totalAmount", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>丸め単位</Label>
        <Select
          value={String(roundingUnit)}
          onValueChange={(v) => v && onChange("roundingUnit", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100円単位</SelectItem>
            <SelectItem value="500">500円単位</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
