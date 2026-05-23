import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Review, SupabaseReviewRow, ToiletWithDistance } from "@/lib/types";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

const STORAGE_KEY = STORAGE_KEYS.reviews;

export type ReviewDraft = Omit<Review, "id" | "createdAt">;

export type ReviewStorageMode = "supabase" | "local";

export type CreateReviewResult = {
  review: Review;
  storage: ReviewStorageMode;
};

export function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLocalReviews(toiletId?: string, reviews = getStoredReviews()): Review[] {
  return toiletId ? reviews.filter((review) => review.toiletId === toiletId) : reviews;
}

export function createLocalReview(draft: ReviewDraft): Review {
  const review: Review = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const reviews = getStoredReviews();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([review, ...reviews]));
  window.dispatchEvent(new Event("toilet-reviews-updated"));
  return review;
}

export async function getReviews(toiletId: string): Promise<Review[]> {
  if (!isSupabaseEnabled() || !supabase) {
    return getLocalReviews(toiletId);
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("toilet_id", toiletId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(supabaseRowToReview);
}

export async function getAllReviews(): Promise<Review[]> {
  if (!isSupabaseEnabled() || !supabase) {
    return getStoredReviews().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(supabaseRowToReview);
}

export async function createReview(draft: ReviewDraft): Promise<CreateReviewResult> {
  if (!isSupabaseEnabled() || !supabase) {
    return {
      review: createLocalReview(draft),
      storage: "local"
    };
  }

  const review: Review = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const { data, error } = await supabase.from("reviews").insert(reviewToSupabaseInsert(review)).select("*").single();
  if (error) throw error;

  window.dispatchEvent(new Event("toilet-reviews-updated"));
  return {
    review: data ? supabaseRowToReview(data) : review,
    storage: "supabase"
  };
}

export function reviewOverall(review: Review): number {
  return review.rating ?? (review.cleanliness + (6 - review.crowdLevel) + review.accessibility + review.equipment) / 4;
}

export function reviewToSupabaseInsert(review: Review) {
  return {
    id: review.id,
    toilet_id: review.toiletId,
    rating: reviewOverall(review),
    cleanliness: review.cleanliness,
    crowding: review.crowdLevel,
    usability: review.accessibility,
    facilities: review.equipment,
    comment: review.comment || null,
    created_at: review.createdAt
  };
}

export function supabaseRowToReview(row: SupabaseReviewRow): Review {
  return {
    id: row.id,
    toiletId: row.toilet_id,
    rating: row.rating ?? undefined,
    cleanliness: row.cleanliness,
    crowdLevel: row.crowding,
    accessibility: row.usability,
    equipment: row.facilities,
    comment: row.comment ?? "",
    createdAt: row.created_at
  };
}

export function averageRating(reviews: Review[]): number | undefined {
  if (reviews.length === 0) return undefined;
  const total = reviews.reduce((sum, review) => sum + reviewOverall(review), 0);
  return Number((total / reviews.length).toFixed(1));
}

export function averageCleanliness(reviews: Review[]): number | undefined {
  if (reviews.length === 0) return undefined;
  const total = reviews.reduce((sum, review) => sum + review.cleanliness, 0);
  return Number((total / reviews.length).toFixed(1));
}

export function enrichToiletsWithReviews(toilets: ToiletWithDistance[]): ToiletWithDistance[] {
  const reviews = getStoredReviews();
  return toilets.map((toilet) => {
    const toiletReviews = getLocalReviews(toilet.id, reviews);
    return {
      ...toilet,
      reviewRating: averageRating(toiletReviews),
      cleanlinessAverage: averageCleanliness(toiletReviews)
    };
  });
}
