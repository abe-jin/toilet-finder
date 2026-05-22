"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getAllReviews, isSupabaseEnabled, reviewOverall } from "@/lib/reviews";
import type { Review } from "@/lib/types";
import { AlertCircle, ArrowRight, HardDrive, MessageSquareText, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nextReviews = await getAllReviews();
        if (!active) return;
        setReviews(nextReviews);
        setError(false);
      } catch {
        if (!active) return;
        setReviews([]);
        setError(true);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void load();
    window.addEventListener("toilet-reviews-updated", load);
    return () => {
      active = false;
      window.removeEventListener("toilet-reviews-updated", load);
    };
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50 pb-32">
      <header className="bg-white px-4 pb-5 pt-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Reviews</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">レビュー</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">投稿されたトイレレビューを確認できます</p>
        {!isSupabaseEnabled() ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
            <HardDrive size={14} />
            Supabase未設定のため、この端末内のレビューを表示しています
          </div>
        ) : null}
      </header>

      <section className="space-y-3 px-4 pt-4">
        {loading ? (
          <Card className="p-4">
            <p className="text-sm font-bold text-slate-500">レビューを読み込んでいます</p>
          </Card>
        ) : null}

        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="レビューを取得できませんでした"
            description="通信状況を確認して、もう一度お試しください。"
          />
        ) : null}

        {!loading && !error && reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="まだレビューはありません"
            description="トイレ詳細ページからレビューを投稿できます"
            action={
              <Link href="/">
                <Button>近くのトイレを探す</Button>
              </Link>
            }
          />
        ) : null}

        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
                    <Star size={15} className="fill-current" />
                    {reviewOverall(review).toFixed(1)}
                  </div>
                  <Badge>toilet_id</Badge>
                </div>
                <p className="mt-2 break-all text-xs font-bold text-slate-500">{review.toiletId}</p>
              </div>
              <Link
                href={`/toilet/${review.toiletId}`}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm"
                aria-label="該当トイレ詳細へ"
              >
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <p className="rounded-2xl bg-slate-50 px-3 py-2">清潔さ {review.cleanliness}</p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2">混雑度 {review.crowdLevel}</p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2">使いやすさ {review.accessibility}</p>
              <p className="rounded-2xl bg-slate-50 px-3 py-2">設備 {review.equipment}</p>
            </div>

            {review.comment ? (
              <p className="mt-3 whitespace-pre-wrap text-sm font-bold leading-6 text-slate-700">{review.comment}</p>
            ) : (
              <p className="mt-3 text-sm font-bold text-slate-400">コメントなし</p>
            )}

            <time className="mt-3 block text-xs font-bold text-slate-400">{formatDate(review.createdAt)}</time>
          </Card>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
