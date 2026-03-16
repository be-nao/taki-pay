"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Bell } from "lucide-react";
import type { Participant, PaymentClaim, PaymentStatus } from "@/types";
import { verifyPaymentClaim } from "@/lib/firestore/payment_claims";
import { useState } from "react";

interface MemberRow {
  participant: Participant;
  claim?: PaymentClaim;
}

interface Props {
  members: MemberRow[];
  payUrl: (participantId: string) => string;
  onVerified: (claimId: string) => void;
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "未払い",
  reported: "報告済み",
  verified: "承認済み",
};

const STATUS_VARIANT: Record<PaymentStatus, "destructive" | "secondary" | "default"> = {
  unpaid: "destructive",
  reported: "secondary",
  verified: "default",
};

export function MemberStatusList({ members, payUrl, onVerified }: Props) {
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleVerify = async (claimId: string) => {
    setVerifying(claimId);
    try {
      await verifyPaymentClaim(claimId);
      onVerified(claimId);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-2">
      {members.map(({ participant, claim }) => {
        const status: PaymentStatus = claim?.status ?? "unpaid";
        return (
          <Card key={participant.id} className="rounded-xl">
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{participant.temporary_name}</p>
                <p className="text-sm text-muted-foreground">
                  ¥{participant.calculated_amount.toLocaleString()}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[status]}>
                {STATUS_LABEL[status]}
              </Badge>
              {status === "reported" && claim && (
                <Button
                  size="sm"
                  className="rounded-lg bg-[#00c543] hover:bg-[#009e35] text-white"
                  disabled={verifying === claim.id}
                  onClick={() => handleVerify(claim.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  承認
                </Button>
              )}
              {status === "unpaid" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => {
                    const url = payUrl(participant.id);
                    navigator.clipboard.writeText(url);
                  }}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  URLコピー
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
