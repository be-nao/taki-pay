import { Card, CardContent } from "@/components/ui/card";

interface Props {
  eventTitle: string;
  participantName: string;
  amount: number;
}

export function EventHeroCard({ eventTitle, participantName, amount }: Props) {
  return (
    <Card className="rounded-xl overflow-hidden border-0 shadow-lg">
      <div className="bg-[#ff0033] px-6 py-4">
        <p className="text-white/80 text-sm">{eventTitle}</p>
        <p className="text-white font-bold text-lg">{participantName} さんの支払額</p>
      </div>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground text-sm mb-1">お支払い金額</p>
        <p className="text-5xl font-bold tracking-tight">
          ¥{amount.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
