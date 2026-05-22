import type { Review } from "@/lib/types";

const STORAGE_KEY = "toilet-finder-reviews-v1";

export type ReviewDraft = Omit<Review, "id" | "createdAt">;

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

export function saveReview(draft: ReviewDraft): Review {
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

export function getReviewsForToilet(toiletId: string, reviews = getStoredReviews()): Review[] {
  return reviews.filter((review) => review.toiletId === toiletId);
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

export function supabaseRowToReview(row: {
  id: string;
  toilet_id: string;
  rating: number | null;
  cleanliness: number;
  crowding: number;
  usability: number;
  facilities: number;
  comment: string | null;
  created_at: string;
}): Review {
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
