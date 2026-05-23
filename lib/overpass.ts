import type { Coordinates, Toilet, ToiletCategory, ToiletFetchDebug, ToiletFetchResult } from "@/lib/types";

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

const OVERPASS_SEARCH_RADIUS_METERS = 1500;
const OVERPASS_QUERY_TIMEOUT_SECONDS = 8;
const OVERPASS_CLIENT_TIMEOUT_MS = 10_000;
const OVERPASS_TOTAL_TIMEOUT_MS = 22_000;

const PUBLIC_FACILITY_AMENITIES = new Set([
  "public_building",
  "townhall",
  "community_centre",
  "library",
  "hospital",
  "clinic",
  "school",
  "university",
  "college",
  "bus_station",
  "train_station",
  "ferry_terminal",
  "marketplace",
  "parking"
]);

function compactText(value?: string) {
  return value?.trim() || undefined;
}

function inferPlaceLabel(tags: Record<string, string>): string | undefined {
  return (
    compactText(tags.name) ||
    compactText(tags["name:ja"]) ||
    compactText(tags.operator) ||
    compactText(tags.brand) ||
    compactText(tags["addr:neighbourhood"]) ||
    compactText(tags["addr:suburb"]) ||
    compactText(tags["addr:quarter"]) ||
    compactText(tags["addr:ward"]) ||
    compactText(tags["addr:city"]) ||
    compactText(tags["addr:street"])
  );
}

function inferCategory(tags: Record<string, string>): ToiletCategory {
  if (
    tags.railway ||
    tags.public_transport ||
    tags.station ||
    tags.amenity === "bus_station" ||
    tags.amenity === "train_station" ||
    tags.building === "train_station"
  ) {
    return "駅";
  }

  if (tags.leisure === "park" || tags.boundary === "national_park" || tags.landuse === "recreation_ground") {
    return "公園";
  }

  if (tags.shop === "convenience" || tags.brand?.toLowerCase().includes("familymart")) {
    return "コンビニ内";
  }

  if (
    tags.shop ||
    tags.mall ||
    tags.tourism === "hotel" ||
    tags.amenity === "marketplace" ||
    tags.building === "retail" ||
    tags.building === "commercial"
  ) {
    return "商業施設";
  }

  return "公共施設";
}

function inferDisplayName(tags: Record<string, string>, isDedicatedToilet: boolean, isToiletFacility: boolean) {
  const explicitName = compactText(tags.name) || compactText(tags["name:ja"]);
  if (explicitName) return explicitName;

  const placeLabel = inferPlaceLabel(tags);
  if (isDedicatedToilet) return placeLabel ? `${placeLabel} 公衆トイレ` : "公衆トイレ";
  if (isToiletFacility) return placeLabel ? `${placeLabel} トイレあり施設` : "トイレあり施設";
  return placeLabel ? `${placeLabel} 車椅子対応トイレあり施設` : "車椅子対応トイレあり施設";
}

function buildOverpassQuery(location: Coordinates, radiusMeters: number): string {
  return `
    [out:json][timeout:${OVERPASS_QUERY_TIMEOUT_SECONDS}];
    (
      node["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      way["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      relation["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});

      node["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});
      way["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});
      relation["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});

      node["wheelchair"="yes"]["amenity"~"^(public_building|townhall|community_centre|library|hospital|clinic|school|university|college|bus_station|train_station|ferry_terminal|marketplace|parking)$"](around:${radiusMeters},${location.lat},${location.lng});
      way["wheelchair"="yes"]["amenity"~"^(public_building|townhall|community_centre|library|hospital|clinic|school|university|college|bus_station|train_station|ferry_terminal|marketplace|parking)$"](around:${radiusMeters},${location.lat},${location.lng});
      relation["wheelchair"="yes"]["amenity"~"^(public_building|townhall|community_centre|library|hospital|clinic|school|university|college|bus_station|train_station|ferry_terminal|marketplace|parking)$"](around:${radiusMeters},${location.lat},${location.lng});
    );
    out center tags;
  `;
}

function mapOverpassToToilet(element: OverpassElement): Toilet | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (!lat || !lng) return null;

  const tags = element.tags ?? {};
  const isDedicatedToilet = tags.amenity === "toilets";
  const isToiletFacility = tags.toilets === "yes";
  const isPublicWheelchairFacility =
    tags.wheelchair === "yes" && Boolean(tags.amenity && PUBLIC_FACILITY_AMENITIES.has(tags.amenity));

  if (!isDedicatedToilet && !isToiletFacility && !isPublicWheelchairFacility) return null;

  const name = inferDisplayName(tags, isDedicatedToilet, isToiletFacility);
  const category = inferCategory(tags);
  const wheelchair = tags.wheelchair === "yes";
  const diaperChanging = tags.changing_table === "yes";
  const open24h = tags.opening_hours === "24/7";
  const address =
    tags["addr:full"] ||
    [tags["addr:province"], tags["addr:city"], tags["addr:ward"], tags["addr:street"], tags["addr:housenumber"]]
      .filter(Boolean)
      .join("") ||
    "現在地周辺のOpenStreetMapデータ";

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    address,
    lat,
    lng,
    openingHours: open24h ? "24時間" : tags.opening_hours || "営業時間不明",
    rating: isDedicatedToilet ? 3.8 : 3.6,
    dataKind: isDedicatedToilet ? "real" : "candidate",
    amenities: {
      genderSeparated: tags.unisex !== "yes",
      multipurpose: wheelchair || tags.toilets === "wheelchair",
      diaperChanging,
      washlet: tags.washlet === "yes",
      wheelchair,
      open24h,
      category,
      free: tags.fee !== "yes"
    }
  };
}

function offsetLocation(location: Coordinates, northMeters: number, eastMeters: number): Coordinates {
  const latOffset = northMeters / 111_320;
  const lngOffset = eastMeters / (111_320 * Math.cos((location.lat * Math.PI) / 180));
  return {
    lat: Number((location.lat + latOffset).toFixed(6)),
    lng: Number((location.lng + lngOffset).toFixed(6))
  };
}

export function generateNearbyFallbackToilets(location: Coordinates): Toilet[] {
  const templates: Array<{
    id: string;
    name: string;
    northMeters: number;
    eastMeters: number;
    openingHours: string;
    rating: number;
    amenities: Toilet["amenities"];
  }> = [
    {
      id: "north-200",
      name: "現在地北側 仮設公衆トイレ",
      northMeters: 200,
      eastMeters: 0,
      openingHours: "営業時間不明",
      rating: 3.8,
      amenities: {
        genderSeparated: true,
        multipurpose: true,
        diaperChanging: false,
        washlet: false,
        wheelchair: true,
        open24h: false,
        category: "公共施設",
        free: true
      }
    },
    {
      id: "east-350",
      name: "現在地東側 仮データトイレ",
      northMeters: 0,
      eastMeters: 350,
      openingHours: "営業時間不明",
      rating: 3.6,
      amenities: {
        genderSeparated: true,
        multipurpose: false,
        diaperChanging: true,
        washlet: false,
        wheelchair: false,
        open24h: false,
        category: "公共施設",
        free: true
      }
    },
    {
      id: "southwest-600",
      name: "現在地南西側 仮データトイレ",
      northMeters: -425,
      eastMeters: -425,
      openingHours: "24時間想定",
      rating: 3.9,
      amenities: {
        genderSeparated: true,
        multipurpose: true,
        diaperChanging: true,
        washlet: true,
        wheelchair: true,
        open24h: true,
        category: "公共施設",
        free: true
      }
    }
  ];

  return templates.map((template) => {
    const coordinates = offsetLocation(location, template.northMeters, template.eastMeters);
    return {
      id: `generated-${template.id}-${coordinates.lat}-${coordinates.lng}`,
      name: template.name,
      address: "現在地周辺の仮データ",
      lat: coordinates.lat,
      lng: coordinates.lng,
      openingHours: template.openingHours,
      rating: template.rating,
      dataKind: "generated",
      amenities: template.amenities
    };
  });
}

export async function fetchNearbyToilets(location: Coordinates): Promise<ToiletFetchResult> {
  const startedAt = Date.now();
  const query = buildOverpassQuery(location, OVERPASS_SEARCH_RADIUS_METERS);
  const debug: ToiletFetchDebug = {
    query,
    attempts: [],
    emptyRadii: []
  };

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs >= OVERPASS_TOTAL_TIMEOUT_MS) {
      debug.fallbackReason = "Overpass API timed out before finding usable toilet candidates within 1500m.";
      return { toilets: generateNearbyFallbackToilets(location), source: "generated-fallback", debug };
    }

    const controller = new AbortController();
    const timeoutMs = Math.min(OVERPASS_CLIENT_TIMEOUT_MS, OVERPASS_TOTAL_TIMEOUT_MS - elapsedMs);
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: query,
        signal: controller.signal,
        headers: { "Content-Type": "text/plain;charset=UTF-8" }
      });

      const attempt = { endpoint, radiusMeters: OVERPASS_SEARCH_RADIUS_METERS, status: response.status };

      if (!response.ok) {
        debug.attempts.push({ ...attempt, error: `HTTP ${response.status}` });
        continue;
      }

      const data = (await response.json()) as { elements?: OverpassElement[] };
      const rawElements = data.elements ?? [];
      const toilets = rawElements.map(mapOverpassToToilet).filter((toilet): toilet is Toilet => Boolean(toilet));

      debug.attempts.push({
        ...attempt,
        rawElementCount: rawElements.length,
        mappedToiletCount: toilets.length
      });

      if (toilets.length > 0) {
        return { toilets, source: "overpass", debug };
      }
    } catch (error) {
      debug.attempts.push({
        endpoint,
        radiusMeters: OVERPASS_SEARCH_RADIUS_METERS,
        error: error instanceof Error ? error.message : "Unknown Overpass error"
      });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  debug.fallbackReason = "Overpass API returned no usable toilet candidates within 1500m.";
  return { toilets: generateNearbyFallbackToilets(location), source: "generated-fallback", debug };
}
