import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Coordinates } from "@/lib/types";

const HISTORY_KEY = STORAGE_KEYS.locationSearchHistory;
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export type GeocodingResult = Coordinates & {
  label: string;
  displayName: string;
};

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
};

export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;

  const params = new URLSearchParams({
    q: normalizedQuery,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
    "accept-language": "ja"
  });

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  const places = (await response.json()) as NominatimPlace[];
  const place = places[0];
  if (!place) return null;

  return {
    lat: Number(place.lat),
    lng: Number(place.lon),
    label: place.name?.trim() || normalizedQuery,
    displayName: place.display_name
  };
}

export function getLocationSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function saveLocationSearchHistory(query: string) {
  if (typeof window === "undefined") return;
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return;

  const nextHistory = [
    normalizedQuery,
    ...getLocationSearchHistory().filter((item) => item !== normalizedQuery)
  ].slice(0, 5);

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
}
