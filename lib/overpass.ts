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

// Buildings that indicate private residential use — never display these
const PRIVATE_BUILDINGS = new Set(["house", "apartments", "detached", "residential"]);

// Amenities where toilet access is typically customer-only
const CUSTOMER_FACILITY_AMENITIES = new Set([
  "cafe",
  "restaurant",
  "fast_food",
  "bar",
  "pub",
  "fuel"
]);

// Public institutions where toilets are generally accessible
const PUBLIC_INSTITUTION_AMENITIES = new Set([
  "library",
  "townhall",
  "community_centre",
  "museum",
  "hospital",
  "clinic",
  "university",
  "college",
  "school",
  "public_building",
  "marketplace",
  "bus_station",
  "train_station",
  "ferry_terminal"
]);

function compactText(value?: string) {
  return value?.trim() || undefined;
}

// Returns true when the element should be excluded from display
function shouldExclude(tags: Record<string, string>): boolean {
  // Dedicated toilet nodes are never excluded — only suppress if access is explicitly private/no
  if (tags.amenity === "toilets" || tags.building === "toilets") {
    const access = tags.access;
    if (access === "private" || access === "no") return true;
    const toiletsAccess = tags["toilets:access"];
    if (toiletsAccess === "private" || toiletsAccess === "no") return true;
    return false;
  }

  // Explicitly private or inaccessible
  const access = tags.access;
  if (access === "private" || access === "no") return true;
  const toiletsAccess = tags["toilets:access"];
  if (toiletsAccess === "private" || toiletsAccess === "no") return true;

  // Private residential buildings
  if (tags.building && PRIVATE_BUILDINGS.has(tags.building)) return true;

  return false;
}

function inferDisplayName(tags: Record<string, string>, isDedicatedToilet: boolean): string {
  const explicitName = compactText(tags.name) || compactText(tags["name:ja"]);

  if (isDedicatedToilet) {
    // For dedicated toilets, use the name as-is; fall back to 公衆トイレ
    return explicitName || "公衆トイレ";
  }

  // For toilets=yes facilities, always append suffix for clarity
  return explicitName ? `${explicitName} トイレあり施設` : "トイレあり施設";
}

function inferCategory(tags: Record<string, string>, isDedicatedToilet: boolean): ToiletCategory {
  if (isDedicatedToilet) return "公衆トイレ";

  // Transport hubs
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

  // Parks / green spaces
  if (
    tags.leisure === "park" ||
    tags.boundary === "national_park" ||
    tags.landuse === "recreation_ground"
  ) {
    return "公園";
  }

  // Public institutions
  if (tags.amenity && PUBLIC_INSTITUTION_AMENITIES.has(tags.amenity)) {
    return "公共施設";
  }

  // Convenience stores — customer-only toilet
  if (tags.shop === "convenience") return "店舗・施設に確認";

  // Cafes / restaurants / fuel — customer-only
  if (tags.amenity && CUSTOMER_FACILITY_AMENITIES.has(tags.amenity)) {
    return "店舗・施設に確認";
  }

  // Shopping facilities
  if (
    tags.shop ||
    tags.amenity === "shopping_mall" ||
    tags.building === "retail" ||
    tags.building === "commercial" ||
    tags.building === "shopping_centre"
  ) {
    return "商業施設";
  }

  // permissive / customers access without more specific category
  const toiletsAccess = tags["toilets:access"];
  if (toiletsAccess === "customers" || toiletsAccess === "permissive") {
    return "利用条件あり";
  }

  return "トイレあり施設";
}

// Infer whether the toilet is free to use
function inferFree(tags: Record<string, string>, isDedicatedToilet: boolean): boolean {
  if (tags.fee === "yes") return false;
  if (tags["toilets:access"] === "customers") return false;
  // Customer-facing commercial facilities — treat as non-free for public
  if (!isDedicatedToilet) {
    if (tags.shop === "convenience" || tags.shop === "supermarket") return false;
    if (tags.amenity && CUSTOMER_FACILITY_AMENITIES.has(tags.amenity)) return false;
  }
  return true;
}

function buildOverpassQuery(location: Coordinates, radiusMeters: number): string {
  return `
    [out:json][timeout:${OVERPASS_QUERY_TIMEOUT_SECONDS}];
    (
      node["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      way["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      relation["amenity"="toilets"](around:${radiusMeters},${location.lat},${location.lng});

      node["building"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      way["building"="toilets"](around:${radiusMeters},${location.lat},${location.lng});
      relation["building"="toilets"](around:${radiusMeters},${location.lat},${location.lng});

      node["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});
      way["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});
      relation["toilets"="yes"](around:${radiusMeters},${location.lat},${location.lng});
    );
    out center tags;
  `;
}

function mapOverpassToToilet(element: OverpassElement): Toilet | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (!lat || !lng) return null;

  const tags = element.tags ?? {};
  const isDedicatedToilet = tags.amenity === "toilets" || tags.building === "toilets";
  const isToiletFacility = tags.toilets === "yes";

  // Must have at least one of the two real toilet indicators
  if (!isDedicatedToilet && !isToiletFacility) return null;

  // Exclude private / residential elements
  if (shouldExclude(tags)) return null;

  const name = inferDisplayName(tags, isDedicatedToilet);
  const category = inferCategory(tags, isDedicatedToilet);
  const wheelchair = tags.wheelchair === "yes";
  const diaperChanging = tags.changing_table === "yes";
  const open24h = tags.opening_hours === "24/7";
  const free = inferFree(tags, isDedicatedToilet);

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
      free
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
        category: "公衆トイレ",
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
        category: "公衆トイレ",
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
        category: "公衆トイレ",
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

  // サーバーサイドプロキシ経由を先に試す（CORS・rate limit回避）
  try {
    const proxyUrl = `/api/nearby-toilets?lat=${location.lat}&lng=${location.lng}`;
    const proxyRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(16_000) });
    if (proxyRes.ok) {
      const data = await proxyRes.json() as { elements?: OverpassElement[] };
      const rawElements = data.elements ?? [];
      const toilets: Toilet[] = [];
      for (const el of rawElements) {
        const mapped = mapOverpassToToilet(el);
        if (mapped) toilets.push(mapped);
      }
      if (toilets.length > 0) {
        return { toilets, source: "overpass", debug };
      }
    }
  } catch {
    // プロキシ失敗時は直接アクセスにフォールバック
  }

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

      let noCoordinates = 0;
      let notToiletTag = 0;
      let excludedByFilter = 0;
      const toilets: Toilet[] = [];
      for (const el of rawElements) {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) { noCoordinates++; continue; }
        const t = el.tags ?? {};
        const isDedicated = t.amenity === "toilets" || t.building === "toilets";
        const isFacility = t.toilets === "yes";
        if (!isDedicated && !isFacility) { notToiletTag++; continue; }
        if (shouldExclude(t)) { excludedByFilter++; continue; }
        const mapped = mapOverpassToToilet(el);
        if (mapped) toilets.push(mapped);
      }

      debug.attempts.push({
        ...attempt,
        rawElementCount: rawElements.length,
        mappedToiletCount: toilets.length,
        noCoordinates,
        notToiletTag,
        excludedByFilter
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
