"use client";

import { Button } from "@/components/ui/Button";
import { createReview, getReviewCooldownSeconds } from "@/lib/reviews";
import { isSupabaseEnabled } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, HardDrive, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";

type ReviewFormProps = {
  toiletId: string;
  onSubmitted?: () => void;
};

type ReviewField = "cleanliness" | "crowdLevel" | "accessibility" | "equipment";

const fields: { key: ReviewField; label: string; help: string }[] = [
  { key: "cleanliness", label: "清潔さ", help: "清掃状態" },
  { key: "crowdLevel", label: "混雑度", help: "少ないほど高評価" },
  { key: "accessibility", label: "使いやすさ", help: "動線・広さ" },
  { key: "equipment", label: "設備", help: "備品・機能" }
];

const COMMENT_MAX_LENGTH = 500;

export function ReviewForm({ toiletId, onSubmitted }: ReviewFormProps) {
  const [values, setValues] = useState<Record<ReviewField, number>>({
    cleanliness: 4,
    crowdLevel: 3,
    accessibility: 4,
    equipment: 4
  });
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(() => getReviewCooldownSeconds(toiletId));

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const intervalId = window.setInterval(() => {
      setCooldownSeconds(getReviewCooldownSeconds(toiletId));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds, toiletId]);

  const setRating = (key: ReviewField, value: number) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
          const result = await createReview({ toiletId, comment, ...values });
          setComment("");
          setMessage({
            type: "success",
            text: result.storage === "supabase" ? "レビューを投稿しました" : "レビューをこの端末に保存しました"
          });
          setCooldownSeconds(getReviewCooldownSeconds(toiletId));
          window.setTimeout(() => setMessage(null), 3200);
          onSubmitted?.();
        } catch (error) {
          const isCooldown = error instanceof Error && error.message === "cooldown";
          if (!isCooldown) console.error("[ReviewForm] Failed to submit review:", error);
          setMessage({
            type: "error",
            text: isCooldown
              ? "すでにレビューを投稿済みです。時間をおいて再度お試しください。"
              : "レビュー投稿に失敗しました。もう一度お試しください"
          });
          setCooldownSeconds(getReviewCooldownSeconds(toiletId));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">レビュー投稿</h3>
          <p className="mt-1 text-sm leading-5 text-muted">星をタップして、使った感覚をすばやく残せます。</p>
        </div>
        {message ? (
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-black",
              message.type === "success" ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"
            )}
          >
            {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {message.type === "success" ? "保存済み" : "エラー"}
          </div>
        ) : null}
      </div>
      {!isSupabaseEnabled() ? (
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
          <HardDrive size={14} />
          この端末内に保存されています
        </div>
      ) : null}
      {message ? (
        <p
          className={cn(
            "rounded-2xl px-3 py-2 text-sm font-bold",
            message.type === "success" ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-700"
          )}
        >
          {message.text}
        </p>
      ) : null}
      {fields.map((field) => (
        <div key={field.key} className="rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-200/60">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink">{field.label}</p>
              <p className="text-xs text-muted">{field.help}</p>
            </div>
            <span className="text-sm font-black text-accent">{values[field.key]}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setRating(field.key, rating)}
                className={cn(
                  "grid h-11 place-items-center rounded-2xl transition active:scale-95",
                  rating <= values[field.key]
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-900/10"
                    : "bg-white text-slate-300 shadow-sm ring-1 ring-slate-200/70"
                )}
                aria-label={`${field.label} ${rating}`}
                aria-pressed={rating <= values[field.key]}
              >
                <Star size={18} className={rating <= values[field.key] ? "fill-current" : ""} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={COMMENT_MAX_LENGTH}
          className="w-full resize-none rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="混み具合、清潔感、設備の気づきを書く"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {comment.length} / {COMMENT_MAX_LENGTH}
        </p>
      </div>
      {cooldownSeconds > 0 ? (
        <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
          すでにレビューを投稿済みです。時間をおいて再度お試しください。
        </p>
      ) : null}
      <Button className="h-[52px] w-full rounded-[20px]" type="submit" disabled={submitting || cooldownSeconds > 0}>
        <Send size={17} />
        {submitting ? "投稿中" : "投稿する"}
      </Button>
    </form>
  );
}
