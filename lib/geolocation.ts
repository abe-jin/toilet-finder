import type { Coordinates } from "@/lib/types";

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

const NATIVE_OPTIONS = { enableHighAccuracy: true, timeout: 15000 };
const WEB_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

function debugLog(...args: unknown[]): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[geolocation]", ...args);
  }
}

export function getCurrentLocation(
  onSuccess: SuccessCallback,
  onError: ErrorCallback = () => undefined
): void {
  if (isNative()) {
    debugLog("mode: native");
    void import("@capacitor/geolocation").then(({ Geolocation }) => {
      void Geolocation.checkPermissions().then((status) => {
        debugLog("permission state:", status.location);

        const needsRequest = status.location === "prompt" || status.location === "prompt-with-rationale";
        const requestIfNeeded = needsRequest
          ? Geolocation.requestPermissions({ permissions: ["location"] })
          : Promise.resolve(status);

        void requestIfNeeded.then((after) => {
          debugLog("permission after request:", after.location);
          if (after.location !== "granted") {
            debugLog("denied — aborting getCurrentPosition");
            onError();
            return;
          }
          void Geolocation.getCurrentPosition(NATIVE_OPTIONS)
            .then((pos) => {
              debugLog("position acquired:", pos.coords.latitude, pos.coords.longitude);
              void onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            })
            .catch((err: unknown) => {
              debugLog("getCurrentPosition error:", err instanceof Error ? err.message : err);
              onError();
            });
        }).catch((err: unknown) => {
          debugLog("requestPermissions error:", err instanceof Error ? err.message : err);
          onError();
        });
      }).catch((err: unknown) => {
        debugLog("checkPermissions error:", err instanceof Error ? err.message : err);
        onError();
      });
    }).catch((err: unknown) => {
      debugLog("import error:", err instanceof Error ? err.message : err);
      onError();
    });
    return;
  }

  debugLog("mode: web");
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    debugLog("navigator.geolocation not available");
    onError();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      debugLog("position acquired:", pos.coords.latitude, pos.coords.longitude);
      void onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    },
    (err) => {
      debugLog("getCurrentPosition error code:", err.code, "message:", err.message);
      onError();
    },
    WEB_OPTIONS
  );
}
