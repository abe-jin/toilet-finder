import type { Coordinates } from "@/lib/types";

// Detect Capacitor native platform at runtime (not available during SSG)
function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as Window & { Capacitor?: { isNativePlatform?: () => boolean } };
  return win.Capacitor?.isNativePlatform?.() === true;
}

export function isGeolocationAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return isNative() || !!(typeof navigator !== "undefined" && navigator.geolocation);
}

type SuccessCallback = (location: Coordinates) => void | Promise<void>;
type ErrorCallback = () => void;

// Options for Capacitor native
const NATIVE_OPTIONS = { enableHighAccuracy: false, timeout: 5000 };
// Options for web (matches FAST_GEOLOCATION_OPTIONS)
const WEB_OPTIONS: PositionOptions = { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 };

export function getCurrentLocation(
  onSuccess: SuccessCallback,
  onError: ErrorCallback = () => undefined
): void {
  if (isNative()) {
    void import("@capacitor/geolocation")
      .then(({ Geolocation }) =>
        Geolocation.getCurrentPosition(NATIVE_OPTIONS)
          .then((pos) => onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude }))
          .catch(() => onError())
      )
      .catch(() => onError());
    return;
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => { void onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
    () => onError(),
    WEB_OPTIONS
  );
}
