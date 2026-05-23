import type {
  CachedToiletSearch,
  Coordinates,
  Toilet,
  ToiletFetchResult,
  ToiletCategory,
  ToiletFetchDebug,
  ToiletDataSource
} from "@/lib/types";

export const sampleToilets: Toilet[] = [
  {
    id: "sample-shinjuku-station-west",
    name: "新宿駅西口 公衆トイレ",
    address: "東京都新宿区西新宿1丁目",
    lat: 35.69056,
    lng: 139.69964,
    openingHours: "5:00 - 24:30",
    rating: 4.2,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-shinjuku-gyoen",
    name: "新宿御苑 大木戸門トイレ",
    address: "東京都新宿区内藤町11",
    lat: 35.68886,
    lng: 139.71025,
    openingHours: "9:00 - 16:30",
    rating: 4.5,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: false,
      wheelchair: true,
      open24h: false,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-yoyogi-park",
    name: "代々木公園 中央広場トイレ",
    address: "東京都渋谷区代々木神園町2",
    lat: 35.67172,
    lng: 139.69494,
    openingHours: "24時間",
    rating: 4.0,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: false,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-tokyo-station",
    name: "東京駅 丸の内地下トイレ",
    address: "東京都千代田区丸の内1丁目",
    lat: 35.68124,
    lng: 139.76713,
    openingHours: "4:30 - 25:00",
    rating: 4.4,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-hibiya-park",
    name: "日比谷公園 霞門トイレ",
    address: "東京都千代田区日比谷公園",
    lat: 35.67324,
    lng: 139.75514,
    openingHours: "24時間",
    rating: 3.9,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: false,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-shibuya-hikarie",
    name: "渋谷ヒカリエ 11Fトイレ",
    address: "東京都渋谷区渋谷2-21-1",
    lat: 35.65863,
    lng: 139.70303,
    openingHours: "11:00 - 23:00",
    rating: 4.7,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "商業施設",
      free: true
    }
  },
  {
    id: "sample-ueno-park",
    name: "上野公園 噴水前トイレ",
    address: "東京都台東区上野公園",
    lat: 35.71546,
    lng: 139.77324,
    openingHours: "24時間",
    rating: 3.8,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-roppongi-hills",
    name: "六本木ヒルズ ウェストウォークトイレ",
    address: "東京都港区六本木6-10-1",
    lat: 35.66044,
    lng: 139.72922,
    openingHours: "7:00 - 24:00",
    rating: 4.6,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "商業施設",
      free: true
    }
  },
  {
    id: "sample-omotesando-station",
    name: "表参道駅 改札外トイレ",
    address: "東京都港区北青山3丁目",
    lat: 35.66526,
    lng: 139.71259,
    openingHours: "5:00 - 24:30",
    rating: 4.1,
    amenities: {
      genderSeparated: true,
      multipurpose: false,
      diaperChanging: false,
      washlet: true,
      wheelchair: false,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-familymart-nishiazabu",
    name: "ファミリーマート 西麻布店トイレ",
    address: "東京都港区西麻布3丁目",
    lat: 35.65903,
    lng: 139.7235,
    openingHours: "24時間",
    rating: 3.7,
    amenities: {
      genderSeparated: false,
      multipurpose: false,
      diaperChanging: false,
      washlet: true,
      wheelchair: false,
      open24h: true,
      category: "コンビニ内",
      free: true
    }
  }
];

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

const SEARCH_RADII_METERS = [500, 1000, 1500];
const OVERPASS_REQUEST_TIMEOUT_MS = 6_000;
const OVERPASS_TOTAL_TIMEOUT_MS = 14_000;

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
    [out:json][timeout:12];
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
  const debug: ToiletFetchDebug = {
    query: buildOverpassQuery(location, SEARCH_RADII_METERS[0]),
    attempts: [],
    emptyRadii: []
  };

  for (const radiusMeters of SEARCH_RADII_METERS) {
    const query = buildOverpassQuery(location, radiusMeters);
    debug.query = query;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs >= OVERPASS_TOTAL_TIMEOUT_MS) {
        debug.fallbackReason = "Overpass API timed out before finding usable toilet candidates within 1500m.";
        return { toilets: generateNearbyFallbackToilets(location), source: "generated-fallback", debug };
      }

      const controller = new AbortController();
      const timeoutMs = Math.min(OVERPASS_REQUEST_TIMEOUT_MS, OVERPASS_TOTAL_TIMEOUT_MS - elapsedMs);
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: query,
          signal: controller.signal,
          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          }
        });

        const attempt = {
          endpoint,
          radiusMeters,
          status: response.status
        };

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
          radiusMeters,
          error: error instanceof Error ? error.message : "Unknown Overpass error"
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    debug.emptyRadii.push(radiusMeters);
  }

  debug.fallbackReason = "Overpass API returned no usable toilet candidates within 1500m.";
  return { toilets: generateNearbyFallbackToilets(location), source: "generated-fallback", debug };
}

export function getTokyoSampleToilets(): ToiletFetchResult {
  return {
    toilets: sampleToilets.map((toilet) => ({ ...toilet, dataKind: "sample" })),
    source: "tokyo-sample"
  };
}

export function getToiletById(id: string, toilets: Toilet[] = sampleToilets): Toilet | undefined {
  return toilets.find((toilet) => toilet.id === id);
}

const TOILET_CACHE_KEY = "toilet-finder-last-toilets-v1";
const TOILET_SEARCH_CACHE_KEY = "toilet-finder-last-search-v1";

export function cacheToilets(toilets: Toilet[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage?.setItem(TOILET_CACHE_KEY, JSON.stringify(toilets));
  window.localStorage?.setItem(TOILET_CACHE_KEY, JSON.stringify(toilets));
}

export function cacheToiletSearch(toilets: Toilet[], location: Coordinates, source: ToiletDataSource) {
  if (typeof window === "undefined") return;
  const payload: CachedToiletSearch = {
    toilets,
    location,
    source,
    cachedAt: new Date().toISOString()
  };
  window.localStorage?.setItem(TOILET_SEARCH_CACHE_KEY, JSON.stringify(payload));
  cacheToilets(toilets);
}

export function getCachedToilets(): Toilet[] {
  if (typeof window === "undefined") return sampleToilets;
  try {
    const raw = window.sessionStorage?.getItem(TOILET_CACHE_KEY) ?? window.localStorage?.getItem(TOILET_CACHE_KEY);
    if (!raw) return sampleToilets;
    const parsed = JSON.parse(raw) as Toilet[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleToilets;
  } catch {
    return sampleToilets;
  }
}

export function getCachedToiletSearch(): CachedToiletSearch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage?.getItem(TOILET_SEARCH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedToiletSearch;
    if (
      !Array.isArray(parsed.toilets) ||
      parsed.toilets.length === 0 ||
      typeof parsed.location?.lat !== "number" ||
      typeof parsed.location?.lng !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
