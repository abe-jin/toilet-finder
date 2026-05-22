"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createReport,
  getReportCooldownSeconds,
  isSupabaseEnabled
} from "@/lib/reports";
import type { ToiletReportReason } from "@/lib/types";
import { AlertTriangle, CheckCircle2, ChevronDown, HardDrive, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";

type ToiletReportFormProps = {
  toiletId: string;
};

const reportReasons: { value: ToiletReportReason; label: string }[] = [
  { value: "wrong_location", label: "場所が違う" },
  { value: "closed", label: "閉鎖されている" },
  { value: "unavailable", label: "利用できなかった" },
  { value: "wrong_facilities", label: "設備情報が違う" },
  { value: "inappropriate_review", label: "不適切なレビューがある" },
  { value: "other", label: "その他" }
];

export function ToiletReportForm({ toiletId }: ToiletReportFormProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ToiletReportReason>("wrong_location");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(() => getReportCooldownSeconds(toiletId));
  const storageLabel = isSupabaseEnabled() ? null : "Supabase未設定のため、この端末内に保存されます";

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const intervalId = window.setInterval(() => {
      setCooldownSeconds(getReportCooldownSeconds(toiletId));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds, toiletId]);

  const submit = async () => {
    try {
      setSubmitting(true);
      setMessage(null);
      await createReport({ toiletId, reason, comment });
      setMessage("報告を受け付けました");
      setComment("");
      setCooldownSeconds(getReportCooldownSeconds(toiletId));
    } catch (error) {
      setMessage(error instanceof Error && error.message === "cooldown" ? "短時間に複数回は送信できません。少し時間をおいてください。" : "報告を送信できませんでした。もう一度お試しください。");
      setCooldownSeconds(getReportCooldownSeconds(toiletId));
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || cooldownSeconds > 0;

  return (
    <Card className="p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-amber-50 text-amber-700">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-ink">情報を報告する</h2>
            <p className="mt-0.5 text-sm font-bold text-slate-500">場所・閉鎖・設備違いなどを知らせる</p>
          </div>
        </div>
        <ChevronDown size={20} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <div>
            <p className="text-sm font-black text-ink">報告理由</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {reportReasons.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`min-h-[46px] rounded-[18px] px-3 text-left text-sm font-black ring-1 transition active:scale-[0.98] ${
                    reason === item.value
                      ? "bg-slate-950 text-white ring-slate-950"
                      : "bg-slate-50 text-slate-700 ring-slate-200"
                  }`}
                  onClick={() => setReason(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-black text-ink">コメント</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-2 w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              placeholder="例：入口が封鎖されていました / ピンの位置が道路の反対側です"
            />
          </label>

          <Button type="button" className="h-12 w-full rounded-[20px]" disabled={disabled} onClick={() => void submit()}>
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            報告を送信
          </Button>

          <div className="space-y-1">
            {message ? (
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                {message === "報告を受け付けました" ? <CheckCircle2 size={14} className="text-teal-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
                {message}
              </p>
            ) : null}
            {cooldownSeconds > 0 ? (
              <p className="text-xs font-bold text-slate-500">
                連投防止のため、あと{Math.ceil(cooldownSeconds / 60)}分待ってください。
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
      ) : null}
    </Card>
  );
}
