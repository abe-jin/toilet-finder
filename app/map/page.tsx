"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/Button";
import { averageCleanliness, averageRating, getReviewsForToilet, getStoredReviews } from "@/lib/reviews";
import { cacheLocation, getCachedLocation } from "@/lib/location";
import { cacheToilets, fetchNearbyToilets } from "@/lib/toilets";
import type { Coordinates, LocationStatus, Toilet, ToiletWithDistance } from "@/lib/types";
import { withDistance } from "@/lib/distance";
import { AlertCircle, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ToiletMap = dynamic(() => import("@/components/ToiletMap").then((module) => module.ToiletMap), {
  ssr: false,
  loading: () => <LoadingState label="地図を準備しています" />
});

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
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    const loadFromLocation = async (nextLocation: Coordinates) => {
      setLocation(nextLocation);
      cacheLocation(nextLocation);
      const nearby = await fetchNearbyToilets(nextLocation);
      setToilets(nearby);
      cacheToilets(nearby);
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

  const selected = useMemo(
    () => mappedToilets.find((toilet) => toilet.id === selectedId) ?? mappedToilets[0],
    [mappedToilets, selectedId]
  );

  if (status === "loading") {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <LoadingState />
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
      <ToiletMap
        currentLocation={location}
        toilets={mappedToilets}
        selectedToilet={selected}
        onSelectToilet={(toilet) => setSelectedId(toilet.id)}
      />
      <BottomNav />
    </main>
  );
}
