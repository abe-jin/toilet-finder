"use client";

import { AvailabilityConfirmation } from "@/components/AvailabilityConfirmation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { calculateDistanceMeters, formatDistance, googleMapsDirectionsUrl } from "@/lib/distance";
import type { Coordinates, ToiletWithDistance } from "@/lib/types";
import L from "leaflet";
import {
  Accessibility,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Star,
  X
} from "lucide-react";
import Link from "next/link";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
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
  onDeselect?: () => void;
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
  onSearchArea,
  onDeselect
}: ToiletMapProps) {
  const [mapCenter, setMapCenter] = useState(searchCenter);
  const [mapMoved, setMapMoved] = useState(false);
  // Track which toilet's sheet is expanded by ID.
  // When selectedToilet changes to a different toilet, this won't match the new ID → auto-collapses.
  const [expandedToiletId, setExpandedToiletId] = useState<string | undefined>();

  const isExpanded = expandedToiletId === selectedToilet?.id && expandedToiletId !== undefined;
  const rating = selectedToilet ? (selectedToilet.reviewRating ?? selectedToilet.rating) : 0;

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

      {/* Re-search button */}
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

      {/* Mode label */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur">
        {searchMode === "current"
          ? "現在地周辺を表示中"
          : searchMode === "place" && searchLabel
            ? `${searchLabel}周辺を表示中`
            : "地図の中心周辺を表示中"}
      </div>

      {/* ── Compact sheet ── */}
      {selectedToilet && !isExpanded ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-3 z-10">
          <Card className="pointer-events-auto overflow-hidden p-0 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
            {/* Row 1: name + favorite + dismiss */}
            <div className="flex items-center gap-2 px-4 pt-3">
              <p className="flex-1 truncate text-[15px] font-black leading-snug text-ink">
                {selectedToilet.name}
              </p>
              <FavoriteButton toilet={selectedToilet} className="shrink-0" />
              <button
                type="button"
                onClick={() => onDeselect?.()}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition active:bg-slate-200"
                aria-label="選択解除"
              >
                <X size={14} />
              </button>
            </div>

            {/* Row 2: stats + expand toggle */}
            <div className="flex items-center px-4 pb-1 pt-2">
              <div className="flex flex-1 items-center gap-2 text-[13px] font-black">
                <span className="flex items-center gap-1 text-ink">
                  <MapPin size={12} className="text-accent" />
                  {formatDistance(selectedToilet.distanceMeters)}
                </span>
                <span className="h-3.5 w-px bg-slate-200" />
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock3 size={12} className="text-accent" />
                  徒歩{selectedToilet.walkingMinutes}分
                </span>
                <span className="h-3.5 w-px bg-slate-200" />
                <span className="flex items-center gap-1 text-amber-600">
                  <Star size={11} className="fill-current" />
                  {rating.toFixed(1)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpandedToiletId(selectedToilet.id)}
                className="flex items-center gap-0.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200 transition active:bg-slate-100"
                aria-label="詳細を展開"
              >
                <ChevronUp size={13} />
                詳細
              </button>
            </div>

            {/* Row 3: actions */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
              <Link href={`/toilet?id=${selectedToilet.id}`}>
                <Button className="h-11 w-full rounded-[18px]" variant="secondary">
                  詳細を見る
                </Button>
              </Link>
              <a
                href={googleMapsDirectionsUrl(selectedToilet, currentLocation)}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="h-11 w-full rounded-[18px]">
                  <Navigation size={15} />
                  経路案内
                </Button>
              </a>
            </div>
          </Card>
        </div>
      ) : null}

      {/* ── Expanded sheet ── */}
      {selectedToilet && isExpanded ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-3 z-10 max-h-[45dvh]">
          <Card className="pointer-events-auto flex max-h-[45dvh] flex-col overflow-hidden p-0 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3">
              <p className="flex-1 truncate text-[15px] font-black leading-snug text-ink">
                {selectedToilet.name}
              </p>
              <FavoriteButton toilet={selectedToilet} className="shrink-0" />
              <button
                type="button"
                onClick={() => setExpandedToiletId(undefined)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition active:bg-slate-200"
                aria-label="折り畳む"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDeselect?.()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition active:bg-slate-200"
                aria-label="選択解除"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {/* Stats */}
              <div className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/60">
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-lg font-black text-ink">
                  <MapPin size={15} className="shrink-0 text-accent" />
                  {formatDistance(selectedToilet.distanceMeters)}
                </span>
                <span className="h-6 w-px bg-slate-200" />
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-black text-slate-600">
                  <Clock3 size={15} className="shrink-0 text-accent" />
                  徒歩{selectedToilet.walkingMinutes}分
                </span>
                <span className="h-6 w-px bg-slate-200" />
                <span className="flex items-center gap-1.5 text-sm font-black text-amber-600">
                  <Star size={14} className="fill-current" />
                  {rating.toFixed(1)}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/50">
                  <Clock3 size={13} className="shrink-0 text-accent" />
                  <span className="truncate">{selectedToilet.openingHours}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200/50">
                  <Accessibility size={13} className="shrink-0 text-accent" />
                  <span className="truncate">
                    {selectedToilet.amenities.multipurpose ? "多目的あり" : selectedToilet.amenities.category}
                  </span>
                </div>
              </div>

              {/* Availability confirmation */}
              <AvailabilityConfirmation toiletId={selectedToilet.id} compact />
            </div>

            {/* Actions */}
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-3">
              <Link href={`/toilet?id=${selectedToilet.id}`}>
                <Button className="h-11 w-full rounded-[18px]" variant="secondary">
                  詳細を見る
                </Button>
              </Link>
              <a
                href={googleMapsDirectionsUrl(selectedToilet, currentLocation)}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="h-11 w-full rounded-[18px]">
                  <Navigation size={15} />
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
