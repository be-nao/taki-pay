"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCheck, ExternalLink, Send } from "lucide-react";
import { createPaymentClaim } from "@/lib/firestore/payment_claims";

interface Props {
  amount: number;
  paypayQrUrl: string;
  participantId: string;
  alreadyReported: boolean;
}

export function PayPayActionStep({ amount, paypayQrUrl, participantId, alreadyReported }: Props) {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(alreadyReported);
  const [reporting, setReporting] = useState(false);

  const handlePayPay = async () => {
    await navigator.clipboard.writeText(String(amount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.location.href = paypayQrUrl;
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      await createPaymentClaim(participantId);
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

  return (
    <Card className="rounded-xl">
      <CardContent className="space-y-3 pt-6">
        <p className="text-sm font-medium text-muted-foreground text-center mb-4">
          STEP 1 → STEP 2 の順に操作してください
        </p>

        {/* STEP 1 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-semibold">STEP 1</p>
          <Button
            className="w-full rounded-xl bg-[#ff0033] hover:bg-[#cc0029] text-white h-14 text-base"
            onClick={handlePayPay}
          >
            {copied ? (
              <><CheckCheck className="mr-2 h-5 w-5" />金額コピー済み — PayPay起動中</>
            ) : (
              <><Copy className="mr-2 h-5 w-5" />金額をコピーしてPayPayで払う<ExternalLink className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>

        {/* STEP 2 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-semibold">STEP 2</p>
          <Button
            className="w-full rounded-xl h-14 text-base"
            variant={reported ? "outline" : "default"}
            disabled={reported || reporting}
            onClick={handleReport}
          >
            {reported ? (
              <><CheckCheck className="mr-2 h-5 w-5 text-[#00c543]" />送金を報告済み</>
            ) : (
              <><Send className="mr-2 h-5 w-5" />{reporting ? "報告中..." : "送金完了を報告する"}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
