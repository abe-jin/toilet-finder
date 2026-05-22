"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/Button";
import { averageCleanliness, averageRating, getReviewsForToilet, getStoredReviews } from "@/lib/reviews";
import { cacheLocation, getCachedLocation } from "@/lib/location";
import { cacheToilets, fetchNearbyToilets } from "@/lib/toilets";
import type {
  Coordinates,
  LocationStatus,
  Toilet,
  ToiletDataSource,
  ToiletFetchDebug,
  ToiletWithDistance
} from "@/lib/types";
import { googleMapsDirectionsUrl, withDistance } from "@/lib/distance";
import { AlertCircle, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ToiletMap = dynamic(() => import("@/components/ToiletMap").then((module) => module.ToiletMap), {
  ssr: false,
  loading: () => <LoadingState label="地図を準備しています" />
});

const MAX_DISPLAY_DISTANCE_METERS = 1500;

function enrichToilets(toilets: ToiletWithDistance[]): ToiletWithDistance[] {
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

export default function MapPage() {
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [dataSource, setDataSource] = useState<ToiletDataSource>("generated-fallback");
  const [fetchDebug, setFetchDebug] = useState<ToiletFetchDebug | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    const loadFromLocation = async (nextLocation: Coordinates) => {
      setLocation(nextLocation);
      cacheLocation(nextLocation);
      const result = await fetchNearbyToilets(nextLocation);
      setToilets(result.toilets);
      setDataSource(result.source);
      setFetchDebug(result.debug);
      cacheToilets(result.toilets);
      setStatus("granted");
    };

    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      void loadFromLocation(cachedLocation);
      return;
    }

    if (!navigator.geolocation) {
      window.setTimeout(() => setStatus("error"), 0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await loadFromLocation(nextLocation);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    );
  }, []);

  const mappedToilets = useMemo(() => {
    if (!location) return [];
    return enrichToilets(withDistance(toilets, location));
  }, [location, toilets]);
  const nearbyToilets = useMemo(
    () => mappedToilets.filter((toilet) => toilet.distanceMeters <= MAX_DISPLAY_DISTANCE_METERS),
    [mappedToilets]
  );
  const excludedOverLimitCount = mappedToilets.length - nearbyToilets.length;

  const selected = useMemo(
    () => nearbyToilets.find((toilet) => toilet.id === selectedId) ?? nearbyToilets[0],
    [nearbyToilets, selectedId]
  );
  const closestDistance = nearbyToilets[0]?.distanceMeters;
  const sourceMessage =
    dataSource === "overpass"
      ? closestDistance !== undefined && closestDistance <= 500
        ? "すぐ近くの実在トイレを表示中"
        : closestDistance !== undefined && closestDistance <= 1000
          ? "近くの実在トイレを表示中"
          : "少し離れた実在トイレを表示中"
      : "近くの実在トイレが見つかりませんでした";

  if (status === "loading") {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <LoadingState label="現在地周辺のトイレを探しています" />
        <BottomNav />
      </main>
    );
  }

  if (status === "denied" || status === "error" || !location) {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <EmptyState
          icon={AlertCircle}
          title="地図に現在地を表示できません"
          description="ブラウザの位置情報許可をオンにしてから、もう一度マップを開いてください。"
          action={
            <Button onClick={() => window.location.reload()}>
              <LocateFixed size={17} />
              再取得する
            </Button>
          }
        />
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh bg-white">
      <div className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">Map</p>
        <h1 className="text-base font-black text-ink">近くのトイレ</h1>
      </div>
      <div className="absolute left-4 right-4 top-[92px] z-20 rounded-2xl bg-white/88 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        {sourceMessage}
        {dataSource === "generated-fallback" ? (
          <span className="mt-1 block font-medium text-slate-500">確認用の仮データを表示しています</span>
        ) : null}
        {process.env.NODE_ENV === "development" ? (
          <span className="ml-2 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
            source: {dataSource}
          </span>
        ) : null}
      </div>
      {process.env.NODE_ENV === "development" && fetchDebug ? (
        <details className="absolute left-4 right-4 top-[146px] z-20 rounded-2xl bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-soft backdrop-blur">
          <summary className="cursor-pointer font-black text-white">Overpass debug</summary>
          <div className="mt-2 space-y-1 font-mono leading-5">
            <p>empty radii: {fetchDebug.emptyRadii.join(", ") || "none"}</p>
            {location ? (
              <p>
                current: {location.lat},{location.lng}
              </p>
            ) : null}
            <p>excluded over 1500m: {excludedOverLimitCount}</p>
            <p>fallback: {fetchDebug.fallbackReason ?? "none"}</p>
            {fetchDebug.attempts.map((attempt, index) => (
              <p key={`${attempt.endpoint}-${attempt.radiusMeters}-${index}`}>
                {attempt.radiusMeters}m {attempt.status ?? "-"} raw:{attempt.rawElementCount ?? "-"} mapped:
                {attempt.mappedToiletCount ?? "-"} {attempt.error ? `error:${attempt.error}` : ""}
              </p>
            ))}
            {nearbyToilets.map((toilet) => (
              <p key={toilet.id}>
                toilet {toilet.id}: {toilet.lat},{toilet.lng} distance:{toilet.distanceMeters}m maps:
                {googleMapsDirectionsUrl(toilet, location)}
              </p>
            ))}
          </div>
        </details>
      ) : null}
      <ToiletMap
        currentLocation={location}
        toilets={nearbyToilets}
        selectedToilet={selected}
        onSelectToilet={(toilet) => setSelectedId(toilet.id)}
      />
      <BottomNav />
    </main>
  );
}
