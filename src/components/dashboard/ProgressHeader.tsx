import { Progress } from "@/components/ui/progress";

interface Props {
  verified: number;
  total: number;
  collectedAmount: number;
  totalAmount: number;
}

export function ProgressHeader({ verified, total, collectedAmount, totalAmount }: Props) {
  const rate = total === 0 ? 0 : Math.round((verified / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">回収率</p>
          <p className="text-3xl font-bold">{rate}%</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {verified} / {total} 人 承認済み
        </p>
      </div>
      <Progress value={rate} className="h-3 rounded-full" />
      <p className="text-sm text-right text-muted-foreground">
        ¥{collectedAmount.toLocaleString()} / ¥{totalAmount.toLocaleString()}
      </p>
    </div>
  );
}
