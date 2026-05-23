"use client";

import { Button } from "@/components/ui/Button";
import type { ConfirmationStatus, ToiletConfirmationSummary } from "@/lib/types";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";

export type ConfirmationUIProps = {
  summary: ToiletConfirmationSummary;
  loading: boolean;
  submitting: ConfirmationStatus | null;
  message: string | null;
  cooldownSeconds: number;
  disabled: boolean;
  statusText: string;
  lastConfirmedText: string;
  onSubmit: (status: ConfirmationStatus) => void;
  className?: string;
};

export function CompactAvailabilityConfirmation({
  summary,
  submitting,
  message,
  cooldownSeconds,
  disabled,
  statusText,
  lastConfirmedText,
  onSubmit,
  className
}: ConfirmationUIProps) {
  return (
    <div className={className}>
      <div className="rounded-[20px] bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-black">
            <Clock3 size={14} className="text-accent" />
            {lastConfirmedText}
          </p>
          {summary.hasUnavailableReport ? (
            <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-700">
              使えなかった報告あり
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500">{statusText}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-[16px] bg-teal-600 hover:bg-teal-700"
            disabled={disabled}
            onClick={() => onSubmit("available")}
          >
            {submitting === "available" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            使えました
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-[16px] text-rose-700"
            disabled={disabled}
            onClick={() => onSubmit("unavailable")}
          >
            {submitting === "unavailable" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            使えませんでした
          </Button>
        </div>
        {message || cooldownSeconds > 0 ? (
          <p className="mt-2 text-[11px] font-bold text-slate-500">
            {cooldownSeconds > 0 ? "すでに報告済みです。時間をおいて再度お試しください" : message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
