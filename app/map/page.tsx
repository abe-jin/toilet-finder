"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { LocationSearch } from "@/components/LocationSearch";
import { Button } from "@/components/ui/Button";
import { enrichToiletsWithReviews } from "@/lib/reviews";
import { cacheLocation, getCachedLocation } from "@/lib/location";
import { cacheToiletSearch, fetchNearbyToilets } from "@/lib/toilets";
import type { GeocodingResult } from "@/lib/geocoding";
import type {
  Coordinates,
  LocationStatus,
  Toilet,
  ToiletDataSource,
  ToiletFetchDebug
} from "@/lib/types";
import { calculateDistanceMeters, googleMapsDirectionsUrl, walkingMinutes, withDistance } from "@/lib/distance";
import { FAST_GEOLOCATION_OPTIONS, MAX_DISPLAY_DISTANCE_METERS } from "@/lib/constants";
import { AlertCircle, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ToiletMap = dynamic(() => import("@/components/ToiletMap").then((module) => module.ToiletMap), {
  ssr: false,
  loading: () => <LoadingState label="地図を準備しています" />
});

type SearchMode = "current" | "map-center" | "place";

export default function MapPage() {
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [searchCenter, setSearchCenter] = useState<Coordinates | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("current");
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [areaSearching, setAreaSearching] = useState(false);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [dataSource, setDataSource] = useState<ToiletDataSource>("generated-fallback");
  const [fetchDebug, setFetchDebug] = useState<ToiletFetchDebug | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useEffect(() => {
    const loadFromLocation = async (nextLocation: Coordinates) => {
      setLocation(nextLocation);
      setSearchCenter(nextLocation);
      setSearchMode("current");
      setSearchLabel(null);
      cacheLocation(nextLocation);
      const result = await fetchNearbyToilets(nextLocation);
      const realToilets = result.source === "generated-fallback" ? [] : result.toilets;
      setToilets(realToilets);
      setDataSource(result.source);
      setFetchDebug(result.debug);
      cacheToiletSearch(realToilets, nextLocation, result.source);
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
      FAST_GEOLOCATION_OPTIONS
    );
  }, []);

  const mappedToilets = useMemo(() => {
    const distanceOrigin = location ?? searchCenter;
    if (!distanceOrigin || !searchCenter) return [];
    const displayDistanceToilets = withDistance(toilets, distanceOrigin);
    return enrichToiletsWithReviews(
      displayDistanceToilets.map((toilet) => {
        const searchDistanceMeters = calculateDistanceMeters(searchCenter, toilet);
        return {
          ...toilet,
          searchDistanceMeters,
          walkingMinutes: walkingMinutes(toilet.distanceMeters)
        };
      })
    );
  }, [location, searchCenter, toilets]);
  const nearbyToilets = useMemo(
    () => mappedToilets.filter((toilet) => (toilet.searchDistanceMeters ?? toilet.distanceMeters) <= MAX_DISPLAY_DISTANCE_METERS),
    [mappedToilets]
  );
  const excludedOverLimitCount = mappedToilets.length - nearbyToilets.length;

  const selected = useMemo(
    () => nearbyToilets.find((toilet) => toilet.id === selectedId) ?? nearbyToilets[0],
    [nearbyToilets, selectedId]
  );
  const closestSearchDistance = nearbyToilets[0]?.searchDistanceMeters ?? nearbyToilets[0]?.distanceMeters;
  const areaLabel =
    searchMode === "current"
      ? "現在地周辺を表示中"
      : searchMode === "place" && searchLabel
        ? `${searchLabel}周辺のトイレを表示中`
        : "地図の中心周辺を表示中";
  const sourceMessage =
    dataSource === "overpass"
      ? searchMode === "place" && searchLabel
        ? areaLabel
        : `${areaLabel}・${
          closestSearchDistance !== undefined && closestSearchDistance <= 500
            ? "すぐ近くの実在トイレを表示中"
            : closestSearchDistance !== undefined && closestSearchDistance <= 1000
              ? "近くの実在トイレを表示中"
              : "少し離れた実在トイレを表示中"
        }`
      : searchMode === "map-center"
        ? "このエリアに近くの実在トイレが見つかりませんでした"
        : "近くの実在トイレが見つかりませんでした";

  const searchMapArea = async (center: Coordinates) => {
    setAreaSearching(true);
    setSearchCenter(center);
    setSearchMode("map-center");
    setSearchLabel(null);
    setSelectedId(undefined);
    try {
      const result = await fetchNearbyToilets(center);
      setToilets(result.source === "generated-fallback" ? [] : result.toilets);
      setDataSource(result.source);
      setFetchDebug(result.debug);
      cacheToiletSearch(result.source === "generated-fallback" ? [] : result.toilets, center, result.source);
    } finally {
      setAreaSearching(false);
    }
  };

  const searchByPlace = async (result: GeocodingResult) => {
    const center = { lat: result.lat, lng: result.lng };
    setStatus("granted");
    setAreaSearching(true);
    setSearchCenter(center);
    setSearchMode("place");
    setSearchLabel(result.label);
    setSelectedId(undefined);
    try {
      const toiletResult = await fetchNearbyToilets(center);
      setToilets(toiletResult.source === "generated-fallback" ? [] : toiletResult.toilets);
      setDataSource(toiletResult.source);
      setFetchDebug(toiletResult.debug);
      cacheToiletSearch(toiletResult.source === "generated-fallback" ? [] : toiletResult.toilets, center, toiletResult.source);
    } finally {
      setAreaSearching(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <LoadingState label="現在地周辺のトイレを探しています" />
        <BottomNav />
      </main>
    );
  }

  if ((status === "denied" || status === "error" || !searchCenter) && status !== "granted") {
    return (
      <main className="min-h-dvh bg-white p-5 pb-28">
        <LocationSearch onResolved={searchByPlace} />
        <div className="mt-5">
          <EmptyState
            icon={AlertCircle}
            title="地図に現在地を表示できません"
            description="ブラウザの位置情報許可をオンにするか、駅名・地名で探してください。"
            action={
              <Button onClick={() => window.location.reload()}>
                <LocateFixed size={17} />
                再取得する
              </Button>
            }
          />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (!searchCenter) return null;

  return (
    <main className="relative min-h-dvh bg-white">
      <div className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">Map</p>
        <h1 className="text-base font-black text-ink">近くのトイレ</h1>
      </div>
      <div className="absolute left-4 right-4 top-[74px] z-20">
        <LocationSearch onResolved={searchByPlace} compact />
      </div>
      <div className="absolute left-4 right-4 top-[176px] z-20 rounded-2xl bg-white/88 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        {sourceMessage}
        {process.env.NODE_ENV !== "production" && dataSource === "generated-fallback" ? (
          <span className="mt-1 block font-medium text-slate-500">（開発用）実在トイレなし</span>
        ) : null}
        {process.env.NODE_ENV === "development" ? (
          <span className="ml-2 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
            source: {dataSource}
          </span>
        ) : null}
      </div>
      {process.env.NODE_ENV === "development" && fetchDebug ? (
        <details className="absolute left-4 right-4 top-[230px] z-20 rounded-2xl bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-soft backdrop-blur">
          <summary className="cursor-pointer font-black text-white">Overpass debug</summary>
          <div className="mt-2 space-y-1 font-mono leading-5">
            <p>empty radii: {fetchDebug.emptyRadii.join(", ") || "none"}</p>
            {location ? (
              <p>
                current: {location.lat},{location.lng}
              </p>
            ) : null}
            <p>
              search center: {searchCenter.lat},{searchCenter.lng}
            </p>
            <p>mode: {searchMode}</p>
            <p>label: {searchLabel ?? "-"}</p>
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
                searchDistance:{toilet.searchDistanceMeters ?? "-"}m
                {googleMapsDirectionsUrl(toilet, location)}
              </p>
            ))}
          </div>
        </details>
      ) : null}
      <ToiletMap
        currentLocation={location}
        searchCenter={searchCenter}
        searchMode={searchMode}
        searchLabel={searchLabel}
        searching={areaSearching}
        toilets={nearbyToilets}
        selectedToilet={selected}
        onSelectToilet={(toilet) => setSelectedId(toilet.id)}
        onSearchArea={(center) => void searchMapArea(center)}
      />
      <BottomNav />
    </main>
  );
}
