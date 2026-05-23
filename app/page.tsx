"use client";

import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { LoadingState } from "@/components/LoadingState";
import { LocationSearch } from "@/components/LocationSearch";
import { NearestToiletCard } from "@/components/NearestToiletCard";
import { ToiletCard } from "@/components/ToiletCard";
import { Button } from "@/components/ui/Button";
import { averageCleanliness, averageRating, getLocalReviews, getStoredReviews } from "@/lib/reviews";
import type { GeocodingResult } from "@/lib/geocoding";
import { cacheLocation } from "@/lib/location";
import { cacheToiletSearch, fetchNearbyToilets, getCachedToiletSearch, sampleToilets } from "@/lib/toilets";
import type {
  Coordinates,
  FilterKey,
  LocationStatus,
  Toilet,
  ToiletDataSource,
  ToiletFetchDebug,
  ToiletWithDistance
} from "@/lib/types";
import { googleMapsDirectionsUrl, withDistance } from "@/lib/distance";
import {
  AlertCircle,
  ChevronDown,
  Crosshair,
  HelpCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Toilet as ToiletIcon
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const manualLocations: { label: string; location: Coordinates }[] = [
  { label: "新宿", location: { lat: 35.69056, lng: 139.69964 } },
  { label: "渋谷", location: { lat: 35.65803, lng: 139.70164 } },
  { label: "東京駅", location: { lat: 35.68124, lng: 139.76713 } }
];

const MAX_DISPLAY_DISTANCE_METERS = 1500;
const distanceFilterKeys: FilterKey[] = ["within500m", "within1000m", "within1500m"];
const USAGE_GUIDE_DISMISSED_KEY = "toinavi-usage-guide-dismissed-v1";
const FAST_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 60_000
};

const usageSteps = [
  {
    title: "現在地を許可",
    description: "近くのトイレを自動で探します。",
    icon: ShieldCheck
  },
  {
    title: "トイレを選ぶ",
    description: "距離・設備・レビューを確認できます。",
    icon: ToiletIcon
  },
  {
    title: "経路案内へ",
    description: "Google Mapsで徒歩ルートを開けます。",
    icon: Navigation
  }
];

function enrichToilets(toilets: ToiletWithDistance[], version = 0): ToiletWithDistance[] {
  void version;
  const reviews = getStoredReviews();
  return toilets.map((toilet) => {
    const toiletReviews = getLocalReviews(toilet.id, reviews);
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
    if (filters.includes("within1000m") && toilet.distanceMeters > 1000) return false;
    if (filters.includes("within1500m") && toilet.distanceMeters > 1500) return false;
    if (filters.includes("clean") && (toilet.cleanlinessAverage ?? toilet.rating) < 4.2) return false;
    return true;
  });
}

export default function HomePage() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [toilets, setToilets] = useState<Toilet[]>(sampleToilets);
  const [dataSource, setDataSource] = useState<ToiletDataSource>("tokyo-sample");
  const [fetchDebug, setFetchDebug] = useState<ToiletFetchDebug | undefined>();
  const [filters, setFilters] = useState<FilterKey[]>(["within1500m"]);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [searchLabel, setSearchLabel] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("現在地を確認中");
  const [showingCachedResult, setShowingCachedResult] = useState(false);
  const [usageGuideOpen, setUsageGuideOpen] = useState(false);
  const [usageGuideDismissed, setUsageGuideDismissed] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const onReview = () => setReviewVersion((value) => value + 1);
    window.addEventListener("toilet-reviews-updated", onReview);
    return () => window.removeEventListener("toilet-reviews-updated", onReview);
  }, []);

  const loadToiletsForLocation = async (
    nextLocation: Coordinates,
    options: { label?: string | null } = {}
  ) => {
    setLoadingStep("近くのトイレを検索中");
    setLocation(nextLocation);
    cacheLocation(nextLocation);
    const result = await fetchNearbyToilets(nextLocation);
    setLoadingStep("候補を並び替え中");
    setToilets(result.toilets);
    setDataSource(result.source);
    setFetchDebug(result.debug);
    cacheToiletSearch(result.toilets, nextLocation, result.source);
    setShowingCachedResult(false);
    setStatus("granted");
    if (options.label !== undefined) setSearchLabel(options.label);
  };

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    window.setTimeout(() => {
      setUsageGuideDismissed(window.localStorage?.getItem(USAGE_GUIDE_DISMISSED_KEY) === "true");

      const cached = getCachedToiletSearch();
      if (!cached) return;

      setLocation(cached.location);
      setToilets(cached.toilets);
      setDataSource(cached.source);
      setStatus("granted");
      setShowingCachedResult(true);

      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          void loadToiletsForLocation(nextLocation);
        },
        () => undefined,
        FAST_GEOLOCATION_OPTIONS
      );
    }, 0);
  }, []);

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setLoadingStep("現在地を確認中");
    setStatus("loading");
    setSearchLabel(null);
    setShowingCachedResult(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await loadToiletsForLocation(nextLocation, { label: null });
      },
      () => {
        setStatus("denied");
      },
      FAST_GEOLOCATION_OPTIONS
    );
  };

  const handleManualLocation = async (manualLocation: Coordinates) => {
    setLoadingStep("近くのトイレを検索中");
    setStatus("loading");
    setSearchLabel(null);
    setShowingCachedResult(false);
    await loadToiletsForLocation(manualLocation, { label: null });
  };

  const handleLocationSearch = async (result: GeocodingResult) => {
    setLoadingStep("近くのトイレを検索中");
    setStatus("loading");
    setSearchLabel(result.label);
    setShowingCachedResult(false);
    const nextLocation = { lat: result.lat, lng: result.lng };
    await loadToiletsForLocation(nextLocation, { label: result.label });
  };

  const distanceSorted = useMemo(() => {
    if (!location) return [];
    return enrichToilets(withDistance(toilets, location), reviewVersion);
  }, [location, toilets, reviewVersion]);

  const nearbyToilets = useMemo(
    () => distanceSorted.filter((toilet) => toilet.distanceMeters <= MAX_DISPLAY_DISTANCE_METERS),
    [distanceSorted]
  );
  const excludedOverLimitCount = distanceSorted.length - nearbyToilets.length;
  const filteredToilets = useMemo(() => applyFilters(nearbyToilets, filters), [nearbyToilets, filters]);
  const nearest = filteredToilets[0];
  const closestDistance = nearbyToilets[0]?.distanceMeters;
  const sourceMessage =
    showingCachedResult
      ? "前回の周辺結果を表示中"
      : dataSource === "overpass"
      ? searchLabel
        ? `${searchLabel}周辺のトイレを表示中`
        : closestDistance !== undefined && closestDistance <= 500
          ? "すぐ近くの実在トイレを表示中"
          : closestDistance !== undefined && closestDistance <= 1000
            ? "近くの実在トイレを表示中"
            : "少し離れた実在トイレを表示中"
      : dataSource === "generated-fallback"
        ? "近くの実在トイレが見つかりませんでした"
        : "現在地が取得できなかったため、サンプルデータを表示しています";

  return (
    <main className="min-h-dvh bg-slate-50 pb-32">
      <header className="rounded-b-[30px] bg-white px-4 pb-4 pt-5 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">ToiNavi</p>
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
        <div className="mt-4">
          <LocationSearch onResolved={handleLocationSearch} />
        </div>
      </header>

      {status === "idle" ? (
        <section className="px-4 pt-7">
          <div className="rounded-[34px] bg-slate-950 p-5 text-white shadow-soft ring-1 ring-slate-900/10">
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

          {!usageGuideDismissed ? (
            <div className="mt-5 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[20px] px-2 text-left active:scale-[0.99]"
                onClick={() => setUsageGuideOpen((value) => !value)}
              >
                <span className="flex items-center gap-2 text-sm font-black text-ink">
                  <HelpCircle size={18} className="text-accent" />
                  使い方を見る
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition ${usageGuideOpen ? "rotate-180" : ""}`}
                />
              </button>
              {usageGuideOpen ? (
                <div className="mt-2 space-y-2">
                  {usageSteps.map(({ title, icon: Icon }, index) => (
                    <div key={title} className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-3 py-3 ring-1 ring-slate-200/60">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] bg-white text-accent shadow-sm">
                        <Icon size={17} />
                      </div>
                      <p className="text-sm font-black text-ink">
                        {index + 1}. {index === 1 ? "近くのトイレを確認" : title}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="min-h-10 w-full rounded-[18px] text-xs font-black text-slate-500 transition hover:bg-slate-50"
                    onClick={() => {
                      window.localStorage?.setItem(USAGE_GUIDE_DISMISSED_KEY, "true");
                      setUsageGuideDismissed(true);
                      setUsageGuideOpen(false);
                    }}
                  >
                    今後表示しない
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-600 shadow-sm ring-1 ring-slate-200/80"
              onClick={() => {
                window.localStorage?.removeItem(USAGE_GUIDE_DISMISSED_KEY);
                setUsageGuideDismissed(false);
                setUsageGuideOpen(true);
              }}
            >
              <HelpCircle size={16} className="text-accent" />
              使い方
            </button>
          )}

          <div className="mt-5 rounded-[30px] bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
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
          <LoadingState label={searchLabel ? `${searchLabel}周辺のトイレを探しています` : loadingStep} />
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
          {nearest ? <NearestToiletCard toilet={nearest} currentLocation={location} /> : null}
          <section className="space-y-5 px-4 pt-5">
            <FilterBar
              activeFilters={filters}
              onToggle={(filter) =>
                setFilters((current) => {
                  if (distanceFilterKeys.includes(filter)) {
                    return current.includes(filter)
                      ? current
                      : [...current.filter((item) => !distanceFilterKeys.includes(item)), filter];
                  }
                  return current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter];
                })
              }
            />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-ink">近くのトイレ</h2>
                <p className="text-sm text-muted">{filteredToilets.length}件を近い順に表示</p>
              </div>
              <Search size={21} className="text-slate-400" />
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600 ring-1 ring-slate-200/70">
              {sourceMessage}
              {showingCachedResult ? (
                <span className="mt-1 block font-medium text-slate-500">
                  最新の現在地とトイレ情報をバックグラウンドで更新しています。
                </span>
              ) : null}
              {dataSource === "generated-fallback" ? (
                <span className="mt-1 block font-medium text-slate-500">
                  地図を少し移動するか、手動でエリアを選んでください。確認用データを表示しています。
                </span>
              ) : null}
              {process.env.NODE_ENV === "development" ? (
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                  source: {dataSource}
                </span>
              ) : null}
            </div>
            {process.env.NODE_ENV === "development" && fetchDebug ? (
              <details className="rounded-2xl bg-slate-950 px-3 py-2 text-xs text-slate-200">
                <summary className="cursor-pointer font-black text-white">Overpass debug</summary>
                <div className="mt-2 space-y-1 font-mono leading-5">
                  <p>empty radii: {fetchDebug.emptyRadii.join(", ") || "none"}</p>
                  <p>
                    current: {location.lat},{location.lng}
                  </p>
                  <p>excluded over 1500m: {excludedOverLimitCount}</p>
                  <p>fallback: {fetchDebug.fallbackReason ?? "none"}</p>
                  {nearbyToilets.map((toilet) => (
                    <p key={toilet.id}>
                      toilet {toilet.id}: {toilet.lat},{toilet.lng} distance:{toilet.distanceMeters}m maps:
                      {googleMapsDirectionsUrl(toilet, location)}
                    </p>
                  ))}
                  {fetchDebug.attempts.map((attempt, index) => (
                    <p key={`${attempt.endpoint}-${attempt.radiusMeters}-${index}`}>
                      {attempt.radiusMeters}m {attempt.status ?? "-"} raw:{attempt.rawElementCount ?? "-"} mapped:
                      {attempt.mappedToiletCount ?? "-"} {attempt.error ? `error:${attempt.error}` : ""}
                    </p>
                  ))}
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-2">
                    {fetchDebug.query}
                  </pre>
                </div>
              </details>
            ) : null}
            {filteredToilets.length > 0 ? (
              <div className="space-y-3">
                {filteredToilets.map((toilet) => (
                  <ToiletCard key={toilet.id} toilet={toilet} currentLocation={location} />
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
