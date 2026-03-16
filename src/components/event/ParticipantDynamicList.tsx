"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";

export interface ParticipantRow {
  id: string;
  name: string;
  weight: number;
  fixedAmount: string;
  calculatedAmount: number;
  isOrganizer: boolean;
}

interface Props {
  participants: ParticipantRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof ParticipantRow, value: string | number) => void;
}

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export function ParticipantDynamicList({ participants, onAdd, onRemove, onChange }: Props) {
  return (
    <div className="space-y-3">
      {participants.map((p) => (
        <div key={p.id} className="flex items-center gap-2 rounded-xl border bg-white p-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder={p.isOrganizer ? "幹事名" : "参加者名"}
              value={p.name}
              onChange={(e) => onChange(p.id, "name", e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Select
                value={String(p.weight)}
                onValueChange={(v) => onChange(p.id, "weight", Number(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_OPTIONS.map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      {w}倍
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                placeholder="固定額(任意)"
                value={p.fixedAmount}
                onChange={(e) => onChange(p.id, "fixedAmount", e.target.value)}
                className="w-32"
              />
            </div>
          </div>
          <div className="text-right min-w-[72px]">
            <p className="text-sm text-muted-foreground">金額</p>
            <p className="font-bold text-lg">
              {p.calculatedAmount > 0 ? `¥${p.calculatedAmount.toLocaleString()}` : "—"}
            </p>
          </div>
          {!p.isOrganizer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(p.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" className="w-full rounded-xl" onClick={onAdd}>
        <PlusCircle className="h-4 w-4 mr-2" />
        参加者を追加
      </Button>
    </div>
  );
}
