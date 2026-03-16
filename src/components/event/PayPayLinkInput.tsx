"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function isValidPayPayUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("paypay.ne.jp");
  } catch {
    return false;
  }
}

export function PayPayLinkInput({ value, onChange }: Props) {
  const isValid = value === "" || isValidPayPayUrl(value);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="paypay-url">PayPayマイコードURL</Label>
      <div className="relative">
        <Input
          id="paypay-url"
          placeholder="https://qr.paypay.ne.jp/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={!isValid ? "border-destructive" : ""}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-[#00c543]" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      {!isValid && (
        <p className="text-sm text-destructive">
          有効なPayPay URLを入力してください
        </p>
      )}
    </div>
  );
}
