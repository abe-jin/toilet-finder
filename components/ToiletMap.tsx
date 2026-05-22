"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/distance";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import L from "leaflet";
import { Accessibility, Clock3, Navigation, Star } from "lucide-react";
import Link from "next/link";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const userIcon = L.divIcon({
  className: "",
  html: '<div class="user-marker"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const toiletIcon = L.divIcon({
  className: "",
  html: '<div class="toilet-marker">T</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

function Recenter({ location }: { location: Coordinates }) {
  const map = useMap();
  map.setView([location.lat, location.lng], Math.max(map.getZoom(), 16), { animate: true });
  return null;
}

type ToiletMapProps = {
  currentLocation: Coordinates;
  toilets: ToiletWithDistance[];
  selectedToilet?: ToiletWithDistance;
  onSelectToilet: (toilet: ToiletWithDistance) => void;
};

export function ToiletMap({ currentLocation, toilets, selectedToilet, onSelectToilet }: ToiletMapProps) {
  const selected = selectedToilet ?? toilets[0];

  return (
    <div className="relative h-[calc(100dvh-92px)] min-h-[640px] overflow-hidden bg-slate-100">
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={16}
        scrollWheelZoom
        zoomControl={false}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter location={currentLocation} />
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon} />
        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.lat, toilet.lng]}
            icon={toiletIcon}
            eventHandlers={{
              click: () => onSelectToilet(toilet)
            }}
          />
        ))}
      </MapContainer>

      {selected ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-[104px] z-10">
          <Card className="pointer-events-auto p-3.5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[16px] font-black leading-6 text-ink">{selected.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDistance(selected.distanceMeters)}・徒歩{selected.walkingMinutes}分
                </p>
              </div>
              <div className="shrink-0 rounded-[18px] bg-slate-950 px-3 py-2 text-right text-white">
                <p className="flex items-center gap-1 text-sm font-black">
                  <Star size={14} className="fill-current text-amber-300" />
                  {(selected.reviewRating ?? selected.rating).toFixed(1)}
                </p>
                <p className="text-[10px] font-bold text-white/60">評価</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2">
                <Clock3 size={14} className="text-accent" />
                <span className="truncate">{selected.openingHours}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2">
                <Accessibility size={14} className="text-accent" />
                <span className="truncate">{selected.amenities.multipurpose ? "多目的あり" : selected.amenities.category}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <Link href={`/toilet/${selected.id}`}>
                <Button className="h-[50px] w-full rounded-[20px]" variant="secondary">
                  詳細を見る
                </Button>
              </Link>
              <a
                href={googleMapsDirectionsUrl(selected, currentLocation)}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="icon" aria-label="Google Mapsで開く">
                  <Navigation size={18} />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
