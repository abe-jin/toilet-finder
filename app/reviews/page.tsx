"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getAllReviews, reviewOverall } from "@/lib/reviews";
import { isSupabaseEnabled } from "@/lib/supabase";
import type { Coordinates, Review } from "@/lib/types";
import { calculateDistanceMeters } from "@/lib/distance";
import { getCachedLocation } from "@/lib/location";
import { getCachedToiletSearch } from "@/lib/toilets";
import { AlertCircle, ArrowRight, CalendarDays, HardDrive, MapPin, MessageSquareText, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const DISPLAY_LIMIT = 20;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
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

function ReviewCard({ review, distanceMeters }: { review: Review; distanceMeters?: number }) {
  const distLabel = distanceMeters !== undefined && isFinite(distanceMeters)
    ? formatDistance(distanceMeters)
    : null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
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
            <div className="mt-3 flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-700">公衆トイレ</p>
                  {distLabel ? (
                    <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-600 ring-1 ring-teal-100">
                      {distLabel}
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] font-bold text-slate-400">レビュー投稿先</p>
              </div>
            </div>
          </div>
          <Link
            href={`/toilet?id=${review.toiletId}`}
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
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm font-bold leading-6 text-slate-700">{review.comment}</p>
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
        <Link href={`/toilet?id=${review.toiletId}`}>
          <Button variant="secondary" size="sm" className="rounded-full">
            詳細を見る
            <ArrowRight size={15} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [toiletCoords, setToiletCoords] = useState<Map<string, Coordinates>>(new Map());

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nextReviews = await getAllReviews();
        if (!active) return;
        setReviews(nextReviews);
        setError(false);
      } catch (err) {
        if (!active) return;
        console.error("[ReviewsPage] Failed to fetch reviews:", err);
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

  useEffect(() => {
    window.setTimeout(() => {
      const cachedLoc = getCachedLocation();
      if (cachedLoc) setLocation(cachedLoc);

      const cached = getCachedToiletSearch();
      if (cached) {
        setToiletCoords(new Map(cached.toilets.map((t) => [t.id, { lat: t.lat, lng: t.lng }])));
      }
    }, 0);
  }, []);

  const displayReviews = useMemo(() => {
    if (!location) return reviews.slice(0, DISPLAY_LIMIT);
    return [...reviews]
      .sort((a, b) => {
        const ca = toiletCoords.get(a.toiletId);
        const cb = toiletCoords.get(b.toiletId);
        const da = ca ? calculateDistanceMeters(location, ca) : Infinity;
        const db = cb ? calculateDistanceMeters(location, cb) : Infinity;
        return da - db;
      })
      .slice(0, DISPLAY_LIMIT);
  }, [reviews, location, toiletCoords]);

  return (
    <main className="min-h-dvh bg-slate-50 pb-36">
      <header className="rounded-b-[30px] bg-white px-4 pb-5 pt-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Reviews</p>
            <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">最近のレビュー</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
              {location ? "近くのトイレを優先して表示しています" : "投稿されたトイレレビューを確認できます"}
            </p>
          </div>
          {!loading && !error ? (
            <div className="shrink-0 rounded-[22px] bg-slate-950 px-3 py-2 text-center text-white">
              <p className="text-xl font-black leading-none">{Math.min(reviews.length, DISPLAY_LIMIT)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/60">件</p>
            </div>
          ) : null}
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
            description="レビューの取得に失敗しました。時間をおいて再度お試しください。"
          />
        ) : null}

        {!loading && !error && reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="まだレビューがありません"
            description="トイレ詳細ページからレビューを投稿できます。"
            action={
              <Link href="/">
                <Button>近くのトイレを探す</Button>
              </Link>
            }
          />
        ) : null}

        {displayReviews.map((review) => {
          const coords = toiletCoords.get(review.toiletId);
          const dist = coords && location ? calculateDistanceMeters(location, coords) : undefined;
          return <ReviewCard key={review.id} review={review} distanceMeters={dist} />;
        })}
      </section>

      <BottomNav />
    </main>
  );
}
