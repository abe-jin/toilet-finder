import { sampleToilets } from "@/data/sample-toilets";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CachedToiletSearch, Coordinates, Toilet, ToiletDataSource } from "@/lib/types";

const TOILET_CACHE_KEY = STORAGE_KEYS.toiletCache;
const DEV_SAMPLES_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SAMPLE_TOILETS === "true";
const TOILET_SEARCH_CACHE_KEY = STORAGE_KEYS.toiletSearchCache;
const TOILET_SEARCH_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

export function cacheToilets(toilets: Toilet[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage?.setItem(TOILET_CACHE_KEY, JSON.stringify(toilets));
  window.localStorage?.setItem(TOILET_CACHE_KEY, JSON.stringify(toilets));
}

export function cacheToiletSearch(toilets: Toilet[], location: Coordinates, source: ToiletDataSource) {
  if (typeof window === "undefined") return;
  const payload: CachedToiletSearch = {
    toilets,
    location,
    source,
    cachedAt: new Date().toISOString()
  };
  window.localStorage?.setItem(TOILET_SEARCH_CACHE_KEY, JSON.stringify(payload));
  cacheToilets(toilets);
}

export function getCachedToilets(): Toilet[] {
  const fallback = DEV_SAMPLES_ENABLED ? sampleToilets : [];
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage?.getItem(TOILET_CACHE_KEY) ?? window.localStorage?.getItem(TOILET_CACHE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Toilet[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getCachedToiletSearch(): CachedToiletSearch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage?.getItem(TOILET_SEARCH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedToiletSearch;
    if (
      !Array.isArray(parsed.toilets) ||
      parsed.toilets.length === 0 ||
      typeof parsed.location?.lat !== "number" ||
      typeof parsed.location?.lng !== "number"
    ) {
      return null;
    }
    if (parsed.cachedAt && Date.now() - new Date(parsed.cachedAt).getTime() > TOILET_SEARCH_CACHE_MAX_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
