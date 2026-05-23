"use client";

import { CompactAvailabilityConfirmation } from "@/components/CompactAvailabilityConfirmation";
import { FullAvailabilityConfirmation } from "@/components/FullAvailabilityConfirmation";
import {
  createConfirmation,
  formatLastConfirmed,
  getConfirmationCooldownSeconds,
  getConfirmations,
  summarizeConfirmations
} from "@/lib/confirmations";
import { isSupabaseEnabled } from "@/lib/supabase";
import type { ConfirmationStatus, ToiletConfirmationSummary } from "@/lib/types";
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

function confirmationStatusText(summary: ToiletConfirmationSummary) {
  const total = summary.availableCount + summary.unavailableCount;
  if (total === 0) return "まだ利用確認はありません";
  if (summary.hasUnavailableReport) return `${summary.unavailableCount}件の使えなかった報告あり`;
  return `${summary.availableCount}人が使えたと報告`;
}

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
      setMessage(
        error instanceof Error && error.message === "cooldown"
          ? "すでに報告済みです。時間をおいて再度お試しください"
          : "確認の記録に失敗しました"
      );
      setCooldownSeconds(getConfirmationCooldownSeconds(toiletId));
    } finally {
      setSubmitting(null);
    }
  };

  const disabled = Boolean(submitting) || cooldownSeconds > 0;
  const statusText = loading ? "確認状況を取得中です" : confirmationStatusText(summary);
  const lastConfirmedText = loading ? "最終確認を確認中" : formatLastConfirmed(summary.lastConfirmedAt);
  const uiProps = { summary, loading, submitting, message, cooldownSeconds, disabled, statusText, lastConfirmedText, onSubmit: submit, className };

  if (compact) {
    return <CompactAvailabilityConfirmation {...uiProps} />;
  }

  return <FullAvailabilityConfirmation {...uiProps} storageLabel={storageLabel} />;
}
