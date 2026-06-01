import { type NextRequest, NextResponse } from "next/server";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) return NextResponse.json({ elements: [] }, { status: 400 });

  const radius = 1500;
  const query = `[out:json][timeout:14];(node["amenity"="toilets"](around:${radius},${lat},${lng});way["amenity"="toilets"](around:${radius},${lat},${lng});relation["amenity"="toilets"](around:${radius},${lat},${lng});node["building"="toilets"](around:${radius},${lat},${lng});way["building"="toilets"](around:${radius},${lat},${lng});node["toilets"="yes"](around:${radius},${lat},${lng});way["toilets"="yes"](around:${radius},${lat},${lng}););out center tags;`;

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        signal: AbortSignal.timeout(14_000),
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      continue;
    }
  }
  return NextResponse.json({ elements: [] });
}
