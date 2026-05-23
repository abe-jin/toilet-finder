import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Toilet } from "@/lib/types";

const STORAGE_KEY = STORAGE_KEYS.favorites;
const FAVORITES_EVENT = "toilet-favorites-updated";

export function getFavoriteToilets(): Toilet[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Toilet[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoriteToilet(toiletId: string, favorites = getFavoriteToilets()) {
  return favorites.some((toilet) => toilet.id === toiletId);
}

export function addFavoriteToilet(toilet: Toilet) {
  const favorites = getFavoriteToilets();
  if (isFavoriteToilet(toilet.id, favorites)) return favorites;

  const nextFavorites = [toilet, ...favorites];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
  return nextFavorites;
}

export function removeFavoriteToilet(toiletId: string) {
  const nextFavorites = getFavoriteToilets().filter((toilet) => toilet.id !== toiletId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
  return nextFavorites;
}

export function toggleFavoriteToilet(toilet: Toilet) {
  return isFavoriteToilet(toilet.id) ? removeFavoriteToilet(toilet.id) : addFavoriteToilet(toilet);
}

export function onFavoritesUpdated(callback: () => void) {
  window.addEventListener(FAVORITES_EVENT, callback);
  return () => window.removeEventListener(FAVORITES_EVENT, callback);
}
