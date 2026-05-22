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
  return (review.cleanliness + (6 - review.crowdLevel) + review.accessibility + review.equipment) / 4;
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
