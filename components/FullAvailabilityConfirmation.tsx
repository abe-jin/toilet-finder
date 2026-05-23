"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, CheckCircle2, Clock3, HardDrive, Loader2, XCircle } from "lucide-react";
import type { ConfirmationUIProps } from "./CompactAvailabilityConfirmation";

export function FullAvailabilityConfirmation({
  summary,
  submitting,
  message,
  cooldownSeconds,
  storageLabel,
  disabled,
  statusText,
  lastConfirmedText,
  onSubmit,
  className
}: ConfirmationUIProps & { storageLabel: string | null }) {
  return (
    <Card className={`overflow-hidden p-0 ${className ?? ""}`}>
      <div className="border-b border-slate-200/80 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">Availability</p>
            <h2 className="mt-1 text-lg font-black text-ink">利用できるか確認する</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{statusText}</p>
          </div>
          <div
            className={
              summary.hasUnavailableReport
                ? "rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"
                : "rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700"
            }
          >
            {summary.hasUnavailableReport ? "注意" : "共有"}
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200/70">
          <Clock3 size={14} className="text-accent" />
          {lastConfirmedText}
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[22px] bg-teal-50 p-3 text-teal-800">
            <p className="flex items-center gap-1.5 text-2xl font-black">
              <CheckCircle2 size={20} />
              {summary.availableCount}
            </p>
            <p className="mt-1 text-xs font-black text-teal-700/70">人が使えたと報告</p>
          </div>
          <div className="rounded-[22px] bg-rose-50 p-3 text-rose-800">
            <p className="flex items-center gap-1.5 text-2xl font-black">
              <AlertTriangle size={20} />
              {summary.unavailableCount}
            </p>
            <p className="mt-1 text-xs font-black text-rose-700/70">使えなかった報告</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            className="h-12 rounded-[20px] bg-teal-600 hover:bg-teal-700"
            disabled={disabled}
            onClick={() => onSubmit("available")}
          >
            {submitting === "available" ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
            使えました
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-12 rounded-[20px] text-rose-700"
            disabled={disabled}
            onClick={() => onSubmit("unavailable")}
          >
            {submitting === "unavailable" ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <XCircle size={17} />
            )}
            使えませんでした
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          {message || cooldownSeconds > 0 ? (
            <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
              {cooldownSeconds > 0 ? "すでに報告済みです。時間をおいて再度お試しください" : message}
            </p>
          ) : null}
          {storageLabel ? (
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <HardDrive size={13} />
              {storageLabel}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
