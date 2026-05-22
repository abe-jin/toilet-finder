"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createConfirmation,
  formatLastConfirmed,
  getConfirmationCooldownSeconds,
  getConfirmations,
  isSupabaseEnabled,
  summarizeConfirmations
} from "@/lib/confirmations";
import type { ConfirmationStatus, ToiletConfirmationSummary } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock3, HardDrive, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type AvailabilityConfirmationProps = {
  toiletId: string;
  compact?: boolean;
  className?: string;
};

const emptySummary: ToiletConfirmationSummary = {
  availableCount: 0,
  unavailableCount: 0,
  hasUnavailableReport: false
};

export function AvailabilityConfirmation({ toiletId, compact = false, className }: AvailabilityConfirmationProps) {
  const [summary, setSummary] = useState<ToiletConfirmationSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<ConfirmationStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const storageLabel = isSupabaseEnabled() ? null : "この端末内に保存されます";

  useEffect(() => {
    let active = true;
    const loadConfirmations = async () => {
      try {
        const confirmations = await getConfirmations(toiletId);
        if (!active) return;
        setSummary(summarizeConfirmations(confirmations));
      } catch {
        if (!active) return;
        setMessage("確認状況を取得できませんでした");
      } finally {
        if (!active) return;
        setLoading(false);
        setCooldownSeconds(getConfirmationCooldownSeconds(toiletId));
      }
    };
    void loadConfirmations();
    const onUpdated = () => void loadConfirmations();
    window.addEventListener("toilet-confirmations-updated", onUpdated);
    return () => {
      active = false;
      window.removeEventListener("toilet-confirmations-updated", onUpdated);
    };
  }, [toiletId]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const intervalId = window.setInterval(() => {
      setCooldownSeconds(getConfirmationCooldownSeconds(toiletId));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds, toiletId]);

  const submit = async (status: ConfirmationStatus) => {
    try {
      setSubmitting(status);
      setMessage(null);
      const result = await createConfirmation({ toiletId, status });
      setMessage(result.storage === "supabase" ? "確認を記録しました" : "確認をこの端末に保存しました");
      const confirmations = await getConfirmations(toiletId);
      setSummary(summarizeConfirmations(confirmations));
      setCooldownSeconds(getConfirmationCooldownSeconds(toiletId));
    } catch (error) {
      setMessage(error instanceof Error && error.message === "cooldown" ? "少し時間をおいてから再度お試しください" : "確認の記録に失敗しました");
      setCooldownSeconds(getConfirmationCooldownSeconds(toiletId));
    } finally {
      setSubmitting(null);
    }
  };

  const disabled = Boolean(submitting) || cooldownSeconds > 0;
  const unavailableText = summary.hasUnavailableReport ? "使えない報告あり" : "使えない報告なし";

  if (compact) {
    return (
      <div className={className}>
        <div className="rounded-[20px] bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-black">
              <Clock3 size={14} className="text-accent" />
              {loading ? "確認状況を取得中" : formatLastConfirmed(summary.lastConfirmedAt)}
            </p>
            {summary.hasUnavailableReport ? (
              <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-700">使えない報告あり</span>
            ) : null}
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            {summary.availableCount}人が使えたと報告 / {summary.unavailableCount}件使えない報告
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-[16px] bg-teal-600 hover:bg-teal-700"
              disabled={disabled}
              onClick={() => void submit("available")}
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
              onClick={() => void submit("unavailable")}
            >
              {submitting === "unavailable" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              使えなかった
            </Button>
          </div>
          {message || cooldownSeconds > 0 ? (
            <p className="mt-2 text-[11px] font-bold text-slate-500">
              {cooldownSeconds > 0 ? `連続投稿を防ぐため、あと${Math.ceil(cooldownSeconds / 60)}分待ってください` : message}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">利用確認</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{loading ? "確認状況を取得中です" : formatLastConfirmed(summary.lastConfirmedAt)}</p>
        </div>
        <div className={summary.hasUnavailableReport ? "rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700" : "rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700"}>
          {unavailableText}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
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
          <p className="mt-1 text-xs font-black text-rose-700/70">使えない報告</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          className="h-12 rounded-[20px] bg-teal-600 hover:bg-teal-700"
          disabled={disabled}
          onClick={() => void submit("available")}
        >
          {submitting === "available" ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          使えました
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-[20px] text-rose-700"
          disabled={disabled}
          onClick={() => void submit("unavailable")}
        >
          {submitting === "unavailable" ? <Loader2 size={17} className="animate-spin" /> : <XCircle size={17} />}
          使えなかった
        </Button>
      </div>

      <div className="mt-3 space-y-1">
        {message || cooldownSeconds > 0 ? (
          <p className="text-xs font-bold text-slate-500">
            {cooldownSeconds > 0 ? `連続投稿を防ぐため、あと${Math.ceil(cooldownSeconds / 60)}分待ってください` : message}
          </p>
        ) : null}
        {storageLabel ? (
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <HardDrive size={13} />
            {storageLabel}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
