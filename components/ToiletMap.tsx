"use client";

import { AvailabilityConfirmation } from "@/components/AvailabilityConfirmation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { calculateDistanceMeters, formatDistance, googleMapsDirectionsUrl } from "@/lib/distance";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import L from "leaflet";
import { Accessibility, Clock3, Loader2, MapPin, Navigation, Search, Star } from "lucide-react";
import Link from "next/link";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";

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

function Recenter({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 16), { animate: true });
  }, [center, map]);
  return null;
}

function MapMoveWatcher({
  searchCenter,
  onMovedChange
}: {
  searchCenter: Coordinates;
  onMovedChange: (moved: boolean, center: Coordinates) => void;
}) {
  useMapEvents({
    moveend(event) {
      const map = event.target;
      const center = map.getCenter();
      const nextCenter = { lat: center.lat, lng: center.lng };
      onMovedChange(calculateDistanceMeters(searchCenter, nextCenter) > 80, nextCenter);
    }
  });
  return null;
}

type ToiletMapProps = {
  currentLocation?: Coordinates | null;
  searchCenter: Coordinates;
  searchMode: "current" | "map-center" | "place";
  searchLabel?: string | null;
  searching?: boolean;
  toilets: ToiletWithDistance[];
  selectedToilet?: ToiletWithDistance;
  onSelectToilet: (toilet: ToiletWithDistance) => void;
  onSearchArea: (center: Coordinates) => void;
};

export function ToiletMap({
  currentLocation,
  searchCenter,
  searchMode,
  searchLabel,
  searching = false,
  toilets,
  selectedToilet,
  onSelectToilet,
  onSearchArea
}: ToiletMapProps) {
  const selected = selectedToilet ?? toilets[0];
  const [mapCenter, setMapCenter] = useState(searchCenter);
  const [mapMoved, setMapMoved] = useState(false);

  return (
    <div className="relative h-[calc(100dvh-92px)] min-h-[640px] overflow-hidden bg-slate-100">
      <MapContainer
        center={[searchCenter.lat, searchCenter.lng]}
        zoom={16}
        scrollWheelZoom
        zoomControl={false}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={searchCenter} />
        <MapMoveWatcher
          searchCenter={searchCenter}
          onMovedChange={(moved, center) => {
            setMapMoved(moved);
            setMapCenter(center);
          }}
        />
        {currentLocation ? <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon} /> : null}
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

      {mapMoved ? (
        <div className="pointer-events-none absolute inset-x-4 top-[150px] z-20 flex justify-center">
          <Button
            type="button"
            className="pointer-events-auto h-12 rounded-full px-5 shadow-soft"
            disabled={searching}
            onClick={() => {
              setMapMoved(false);
              onSearchArea(mapCenter);
            }}
          >
            {searching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
            このエリアで再検索
          </Button>
        </div>
      ) : null}

      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur">
        {searchMode === "current" ? "現在地周辺を表示中" : searchMode === "place" && searchLabel ? `${searchLabel}周辺を表示中` : "地図の中心周辺を表示中"}
      </div>

      {selected ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-[104px] z-10">
          <Card className="pointer-events-auto overflow-hidden p-0 shadow-soft">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[16px] font-black leading-6 text-ink">{selected.name}</p>
                  <div className="mt-2 flex items-center gap-3 rounded-[20px] bg-slate-50 px-3 py-2 ring-1 ring-slate-200/60">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-lg font-black text-ink">
                      <MapPin size={15} className="shrink-0 text-accent" />
                      {formatDistance(selected.distanceMeters)}
                    </span>
                    <span className="h-6 w-px bg-slate-200" />
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-black text-slate-600">
                      <Clock3 size={15} className="shrink-0 text-accent" />
                      徒歩{selected.walkingMinutes}分
                    </span>
                  </div>
                </div>
                <div className="shrink-0 rounded-[18px] bg-slate-950 px-3 py-2 text-right text-white">
                  <p className="flex items-center gap-1 text-sm font-black">
                    <Star size={14} className="fill-current text-amber-300" />
                    {(selected.reviewRating ?? selected.rating).toFixed(1)}
                  </p>
                  <p className="text-[10px] font-bold text-white/60">評価</p>
                </div>
                <FavoriteButton toilet={selected} className="shrink-0" />
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
              <AvailabilityConfirmation toiletId={selected.id} compact className="mt-3" />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
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
                <Button className="h-[50px] w-full rounded-[20px]" aria-label="Google Mapsで経路案内を開く">
                  <Navigation size={18} />
                  経路案内
                </Button>
              </a>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
