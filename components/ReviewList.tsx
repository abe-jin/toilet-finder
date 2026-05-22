"use client";

import { EmptyState } from "@/components/EmptyState";
import { averageRating, getReviews, isSupabaseEnabled, reviewOverall } from "@/lib/reviews";
import type { Review } from "@/lib/types";
import { AlertCircle, HardDrive, MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";

export function ReviewList({ toiletId, refreshKey = 0 }: { toiletId: string; refreshKey?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nextReviews = await getReviews(toiletId);
        if (!active) return;
        setReviews(nextReviews);
        setError(false);
      } catch {
        if (!active) return;
        setReviews([]);
        setError(true);
      }
    };
    void load();
    window.addEventListener("toilet-reviews-updated", load);
    return () => {
      active = false;
      window.removeEventListener("toilet-reviews-updated", load);
    };
  }, [toiletId, refreshKey]);

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="レビューを取得できませんでした"
        description="通信状況を確認して、もう一度お試しください。"
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="まだレビューはありません"
        description="使ってみた印象を残すと、次に探す人が清潔さや混み具合を判断しやすくなります。"
      />
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-ink">レビュー</h3>
        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
          <Star size={15} className="fill-current" />
          {averageRating(reviews)?.toFixed(1)}
        </div>
      </div>
      {!isSupabaseEnabled() ? (
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
          <HardDrive size={14} />
          この端末内に保存されています
        </div>
      ) : null}
      {reviews.map((review) => (
        <article key={review.id} className="rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-600">
              <Star size={16} className="fill-current" />
              <span className="text-sm font-black">{reviewOverall(review).toFixed(1)}</span>
            </div>
            <time className="text-xs text-muted">
              {new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(
                new Date(review.createdAt)
              )}
            </time>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
            <p className="rounded-2xl bg-slate-50 px-3 py-2">清潔さ {review.cleanliness}</p>
            <p className="rounded-2xl bg-slate-50 px-3 py-2">混雑度 {review.crowdLevel}</p>
            <p className="rounded-2xl bg-slate-50 px-3 py-2">使いやすさ {review.accessibility}</p>
            <p className="rounded-2xl bg-slate-50 px-3 py-2">設備 {review.equipment}</p>
          </div>
          {review.comment ? <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p> : null}
        </article>
      ))}
    </section>
  );
}
