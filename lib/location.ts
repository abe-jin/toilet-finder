import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Coordinates } from "@/lib/types";

const LOCATION_KEY = STORAGE_KEYS.location;

export function cacheLocation(location: Coordinates) {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function getCachedLocation(): Coordinates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage?.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Coordinates;
    return typeof parsed.lat === "number" && typeof parsed.lng === "number" ? parsed : null;
  } catch {
    return null;
  }
}
