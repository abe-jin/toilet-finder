import type { Coordinates, Toilet, ToiletWithDistance } from "@/lib/types";

const EARTH_RADIUS_METERS = 6371_000;

const toRadians = (value: number) => (value * Math.PI) / 180;

export function calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

export function walkingMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 80));
}

export function formatDistance(distanceMeters?: number): string {
  if (distanceMeters === undefined) return "--";
  if (distanceMeters < 1000) return `${distanceMeters}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function withDistance(toilets: Toilet[], currentLocation: Coordinates): ToiletWithDistance[] {
  return toilets
    .map((toilet) => {
      const distanceMeters = calculateDistanceMeters(currentLocation, toilet);
      return {
        ...toilet,
        distanceMeters,
        walkingMinutes: walkingMinutes(distanceMeters)
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function googleMapsDirectionsUrl(destination: Coordinates, name?: string): string {
  const query = encodeURIComponent(`${destination.lat},${destination.lng}${name ? ` ${name}` : ""}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=walking`;
}
