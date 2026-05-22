"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { LoadingState } from "@/components/LoadingState";
import { NearestToiletCard } from "@/components/NearestToiletCard";
import { ToiletCard } from "@/components/ToiletCard";
import { Button } from "@/components/ui/Button";
import { averageCleanliness, averageRating, getReviewsForToilet, getStoredReviews } from "@/lib/reviews";
import { cacheLocation } from "@/lib/location";
import { cacheToilets, fetchNearbyToilets, sampleToilets } from "@/lib/toilets";
import type { Coordinates, FilterKey, LocationStatus, Toilet, ToiletWithDistance } from "@/lib/types";
import { withDistance } from "@/lib/distance";
import { AlertCircle, Crosshair, LocateFixed, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const manualLocations: { label: string; location: Coordinates }[] = [
  { label: "新宿", location: { lat: 35.69056, lng: 139.69964 } },
  { label: "渋谷", location: { lat: 35.65803, lng: 139.70164 } },
  { label: "東京駅", location: { lat: 35.68124, lng: 139.76713 } }
];

function enrichToilets(toilets: ToiletWithDistance[], version = 0): ToiletWithDistance[] {
  void version;
  const reviews = getStoredReviews();
  return toilets.map((toilet) => {
    const toiletReviews = getReviewsForToilet(toilet.id, reviews);
    return {
      ...toilet,
      reviewRating: averageRating(toiletReviews),
      cleanlinessAverage: averageCleanliness(toiletReviews)
    };
  });
}

function applyFilters(toilets: ToiletWithDistance[], filters: FilterKey[]): ToiletWithDistance[] {
  return toilets.filter((toilet) => {
    if (filters.includes("multipurpose") && !toilet.amenities.multipurpose) return false;
    if (filters.includes("open24h") && !toilet.amenities.open24h) return false;
    if (filters.includes("rating4") && (toilet.reviewRating ?? toilet.rating) < 4) return false;
    if (filters.includes("within500m") && toilet.distanceMeters > 500) return false;
    if (filters.includes("clean") && (toilet.cleanlinessAverage ?? toilet.rating) < 4.2) return false;
    return true;
  });
}

export default function HomePage() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>(sampleToilets);
  const [filters, setFilters] = useState<FilterKey[]>([]);
  const [reviewVersion, setReviewVersion] = useState(0);

  useEffect(() => {
    const onReview = () => setReviewVersion((value) => value + 1);
    window.addEventListener("toilet-reviews-updated", onReview);
    return () => window.removeEventListener("toilet-reviews-updated", onReview);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(nextLocation);
        cacheLocation(nextLocation);
        setStatus("granted");
        const nearby = await fetchNearbyToilets(nextLocation);
        setToilets(nearby);
        cacheToilets(nearby);
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    );
  };

  const handleManualLocation = async (manualLocation: Coordinates) => {
    setStatus("loading");
    setLocation(manualLocation);
    cacheLocation(manualLocation);
    const nearby = await fetchNearbyToilets(manualLocation);
    setToilets(nearby);
    cacheToilets(nearby);
    setStatus("granted");
  };

  const distanceSorted = useMemo(() => {
    if (!location) return [];
    return enrichToilets(withDistance(toilets, location), reviewVersion);
  }, [location, toilets, reviewVersion]);

  const filteredToilets = useMemo(() => applyFilters(distanceSorted, filters), [distanceSorted, filters]);
  const nearest = filteredToilets[0];

  return (
    <main className="min-h-dvh bg-white pb-32">
      <header className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Toilet Finder</p>
            <h1 className="mt-1 text-[26px] font-black tracking-normal text-ink">近くのトイレマップ</h1>
          </div>
          <Link
            href="/map"
            className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm"
            aria-label="マップを開く"
          >
            <MapPin size={22} />
          </Link>
        </div>
      </header>

      {status === "idle" ? (
        <section className="px-4 pt-7">
          <div className="rounded-[34px] bg-slate-950 p-5 text-white shadow-soft">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-teal-200">
              <LocateFixed size={34} />
            </div>
            <h2 className="mt-8 text-[31px] font-black leading-tight">いま一番近いトイレを、すぐに。</h2>
            <p className="mt-3 text-[15px] leading-7 text-white/70">
              位置情報から距離順に表示し、設備・評価・レビューまで一画面で確認できます。
            </p>
            <Button className="mt-6 h-16 w-full rounded-[24px] bg-white text-base text-ink hover:bg-slate-100" onClick={locate}>
              <Crosshair size={20} />
              近くのトイレを探す
            </Button>
          </div>
          <div className="mt-5 rounded-[30px] bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <p className="text-sm font-bold text-ink">手動で場所を選ぶ</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {manualLocations.map((item) => (
                <Button key={item.label} variant="secondary" size="sm" onClick={() => handleManualLocation(item.location)}>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {status === "loading" ? (
        <section className="px-4 pt-8">
          <LoadingState />
        </section>
      ) : null}

      {status === "denied" || status === "error" ? (
        <section className="px-4 pt-8">
          <EmptyState
            icon={AlertCircle}
            title="位置情報を取得できませんでした"
            description="ブラウザの位置情報許可をオンにするか、下の候補から探したい場所を選んでください。"
            action={
              <div className="grid grid-cols-3 gap-2">
                {manualLocations.map((item) => (
                  <Button key={item.label} variant="secondary" size="sm" onClick={() => handleManualLocation(item.location)}>
                    {item.label}
                  </Button>
                ))}
              </div>
            }
          />
        </section>
      ) : null}

      {status === "granted" && location ? (
        <>
          {nearest ? <NearestToiletCard toilet={nearest} /> : null}
          <section className="space-y-5 px-4 pt-5">
            <FilterBar
              activeFilters={filters}
              onToggle={(filter) =>
                setFilters((current) =>
                  current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
                )
              }
            />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-ink">近くのトイレ</h2>
                <p className="text-sm text-muted">{filteredToilets.length}件を近い順に表示</p>
              </div>
              <Search size={21} className="text-slate-400" />
            </div>
            {filteredToilets.length > 0 ? (
              <div className="space-y-3">
                {filteredToilets.map((toilet) => (
                  <ToiletCard key={toilet.id} toilet={toilet} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="条件に合うトイレがありません"
                description="フィルターを減らすと、近くの候補をもう少し広く探せます。"
              />
            )}
          </section>
        </>
      ) : null}

      <div id="reviews" />
      <BottomNav />
    </main>
  );
}
