export type Coordinates = {
  lat: number;
  lng: number;
};

export type ToiletCategory = "コンビニ内" | "公共施設" | "駅" | "公園" | "商業施設";

export type ToiletAmenities = {
  genderSeparated: boolean;
  multipurpose: boolean;
  diaperChanging: boolean;
  washlet: boolean;
  wheelchair: boolean;
  open24h: boolean;
  category: ToiletCategory;
  free: boolean;
};

export type Toilet = Coordinates & {
  id: string;
  name: string;
  address: string;
  openingHours: string;
  rating: number;
  amenities: ToiletAmenities;
};

export type Review = {
  id: string;
  toiletId: string;
  cleanliness: number;
  crowdLevel: number;
  accessibility: number;
  equipment: number;
  comment: string;
  createdAt: string;
};

export type ToiletWithDistance = Toilet & {
  distanceMeters: number;
  walkingMinutes: number;
  reviewRating?: number;
  cleanlinessAverage?: number;
};

export type ToiletDataSource = "overpass" | "generated-fallback" | "tokyo-sample";

export type ToiletFetchResult = {
  toilets: Toilet[];
  source: ToiletDataSource;
};

export type FilterKey = "multipurpose" | "open24h" | "rating4" | "within500m" | "clean";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";
