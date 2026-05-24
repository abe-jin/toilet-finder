export type Coordinates = {
  lat: number;
  lng: number;
};

export type ToiletCategory =
  | "公衆トイレ"
  | "トイレあり施設"
  | "利用条件あり"
  | "店舗・施設に確認"
  | "駅"
  | "公園"
  | "公共施設"
  | "商業施設"
  | "コンビニ内";

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

export type ConfirmationStatus = "available" | "unavailable";

export type ToiletConfirmation = {
  id: string;
  toiletId: string;
  status: ConfirmationStatus;
  createdAt: string;
};

export type ToiletConfirmationSummary = {
  availableCount: number;
  unavailableCount: number;
  lastConfirmedAt?: string;
  hasUnavailableReport: boolean;
};

export type ToiletReportReason =
  | "wrong_location"
  | "closed"
  | "unavailable"
  | "wrong_facilities"
  | "inappropriate_review"
  | "other";

export type ToiletReport = {
  id: string;
  toiletId: string;
  reason: ToiletReportReason;
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

export type SupabaseConfirmationRow = {
  id: string;
  toilet_id: string;
  status: ConfirmationStatus;
  created_at: string;
};

export type SupabaseConfirmationInsert = Omit<SupabaseConfirmationRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type SupabaseReportRow = {
  id: string;
  toilet_id: string;
  reason: ToiletReportReason;
  comment: string | null;
  created_at: string;
};

export type SupabaseReportInsert = Omit<SupabaseReportRow, "id" | "created_at"> & {
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
        Relationships: [];
      };
      confirmations: {
        Row: SupabaseConfirmationRow;
        Insert: SupabaseConfirmationInsert;
        Update: Partial<SupabaseConfirmationInsert>;
        Relationships: [];
      };
      reports: {
        Row: SupabaseReportRow;
        Insert: SupabaseReportInsert;
        Update: Partial<SupabaseReportInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ToiletWithDistance = Toilet & {
  distanceMeters: number;
  walkingMinutes: number;
  searchDistanceMeters?: number;
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
  noCoordinates?: number;
  notToiletTag?: number;
  excludedByFilter?: number;
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

export type CachedToiletSearch = {
  toilets: Toilet[];
  location: Coordinates;
  source: ToiletDataSource;
  cachedAt: string;
};

export type FilterKey = "multipurpose" | "open24h" | "rating4" | "within500m" | "within1000m" | "within1500m" | "clean";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";
