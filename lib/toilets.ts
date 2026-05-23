import { sampleToilets } from "@/data/sample-toilets";
import type { Toilet } from "@/lib/types";

export { sampleToilets } from "@/data/sample-toilets";
export { fetchNearbyToilets, generateNearbyFallbackToilets } from "@/lib/overpass";
export { cacheToilets, cacheToiletSearch, getCachedToilets, getCachedToiletSearch } from "@/lib/toilet-cache";

export function getTokyoSampleToilets() {
  return {
    toilets: sampleToilets.map((toilet) => ({ ...toilet, dataKind: "sample" as const })),
    source: "tokyo-sample" as const
  };
}

export function getToiletById(id: string, toilets: Toilet[] = sampleToilets): Toilet | undefined {
  return toilets.find((toilet) => toilet.id === id);
}
