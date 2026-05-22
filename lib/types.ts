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
  dataKind?: "real" | "candidate" | "generated" | "sample";
  amenities: ToiletAmenities;
};

export type Review = {
  id: string;
  toiletId: string;
  rating?: number;
  cleanliness: number;
  crowdLevel: number;
  accessibility: number;
  equipment: number;
  comment: string;
  createdAt: string;
};

export type SupabaseReviewRow = {
  id: string;
  toilet_id: string;
  rating: number | null;
  cleanliness: number;
  crowding: number;
  usability: number;
  facilities: number;
  comment: string | null;
  created_at: string;
};

export type SupabaseReviewInsert = Omit<SupabaseReviewRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      reviews: {
        Row: SupabaseReviewRow;
        Insert: SupabaseReviewInsert;
        Update: Partial<SupabaseReviewInsert>;
      };
    };
  };
};

export type ToiletWithDistance = Toilet & {
  distanceMeters: number;
  walkingMinutes: number;
  reviewRating?: number;
  cleanlinessAverage?: number;
};

export type ToiletDataSource = "overpass" | "generated-fallback" | "tokyo-sample";

export type OverpassAttemptDebug = {
  endpoint: string;
  radiusMeters: number;
  status?: number;
  rawElementCount?: number;
  mappedToiletCount?: number;
  error?: string;
};

export type ToiletFetchDebug = {
  query: string;
  attempts: OverpassAttemptDebug[];
  emptyRadii: number[];
  fallbackReason?: string;
  excludedOverLimitCount?: number;
};

export type ToiletFetchResult = {
  toilets: Toilet[];
  source: ToiletDataSource;
  debug?: ToiletFetchDebug;
};

export type FilterKey = "multipurpose" | "open24h" | "rating4" | "within500m" | "within1000m" | "within1500m" | "clean";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";
