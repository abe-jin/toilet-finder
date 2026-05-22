"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getAllReviews, isSupabaseEnabled, reviewOverall } from "@/lib/reviews";
import type { Review } from "@/lib/types";
import { AlertCircle, ArrowRight, CalendarDays, HardDrive, MessageSquareText, Sparkles, Star } from "lucide-react";
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

function ReviewScoreTag({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
      <p className="text-[11px] font-black text-slate-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1 text-sm font-black text-ink">
        {value}
        <span className="text-[10px] font-bold text-slate-400">/5</span>
      </p>
    </div>
  );
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
    <main className="min-h-dvh bg-slate-50 pb-36">
      <header className="rounded-b-[30px] bg-white px-4 pb-5 pt-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Reviews</p>
            <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">レビュー</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">投稿されたトイレレビューを確認できます</p>
          </div>
          <div className="shrink-0 rounded-[22px] bg-slate-950 px-3 py-2 text-center text-white">
            <p className="text-xl font-black leading-none">{reviews.length}</p>
            <p className="mt-1 text-[10px] font-bold text-white/60">件</p>
          </div>
        </div>
        {!isSupabaseEnabled() ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/70">
            <HardDrive size={14} />
            Supabase未設定のため、この端末内のレビューを表示しています
          </div>
        ) : null}
      </header>

      <section className="space-y-4 px-4 pt-4">
        {loading ? <LoadingState label="レビューを読み込んでいます" /> : null}

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
          <Card key={review.id} className="overflow-hidden p-0">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-base font-black text-amber-700 ring-1 ring-amber-100">
                      <Star size={17} className="fill-current" />
                      {reviewOverall(review).toFixed(1)}
                    </div>
                    <Badge>
                      <Sparkles size={13} className="mr-1" />
                      総合評価
                    </Badge>
                  </div>
                  <p className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">toilet_id</p>
                  <p className="mt-1 break-all text-xs font-bold leading-5 text-slate-500">{review.toiletId}</p>
                </div>
                <Link
                  href={`/toilet/${review.toiletId}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm active:scale-[0.98]"
                  aria-label="該当トイレ詳細へ"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <ReviewScoreTag label="清潔さ" value={review.cleanliness} />
                <ReviewScoreTag label="混雑度" value={review.crowdLevel} />
                <ReviewScoreTag label="使いやすさ" value={review.accessibility} />
                <ReviewScoreTag label="設備" value={review.equipment} />
              </div>

              <div className="mt-4 rounded-[22px] bg-slate-50 px-3 py-3 ring-1 ring-slate-200/70">
                <p className="text-xs font-black text-slate-500">コメント</p>
                {review.comment ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-slate-700">{review.comment}</p>
                ) : (
                  <p className="mt-2 text-sm font-bold text-slate-400">コメントなし</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/70 px-4 py-3">
              <time className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <CalendarDays size={14} />
                {formatDate(review.createdAt)}
              </time>
              <Link href={`/toilet/${review.toiletId}`}>
                <Button variant="secondary" size="sm" className="rounded-full">
                  詳細を見る
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
