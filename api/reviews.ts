import { Review, ReviewSummary, SubmitRatingPayload, SubmitRatingResponse, UpsertReviewTextPayload } from "@/types";
import instance from "./index";

export async function submitRating(eventId: string, payload: SubmitRatingPayload) {
  const { data } = await instance.post<SubmitRatingResponse>(`/events/${eventId}/rate`, payload);
  return data;
}

export async function getEventReviews(eventId: string) {
  const { data } = await instance.get<Review[]>(`/events/${eventId}/reviews`);
  return data;
}

export async function getMyReview(eventId: string) {
  const { data } = await instance.get<Review | null>(`/events/${eventId}/my-review`);
  return data;
}

export async function getEventRatingSummary(eventId: string) {
  const { data } = await instance.get<ReviewSummary>(`/events/${eventId}/rating`);
  return data;
}

export async function upsertReviewText(eventId: string, payload: UpsertReviewTextPayload) {
  const { data } = await instance.patch<Review>(`/events/${eventId}/review-text`, payload);
  return data;
}


