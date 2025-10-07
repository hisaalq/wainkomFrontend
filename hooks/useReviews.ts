import { getEventRatingSummary, getEventReviews, getMyReview, submitRating, upsertReviewText } from "@/api/reviews";
import { SubmitRatingPayload, UpsertReviewTextPayload } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEventRatingSummary(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId, "ratingSummary"],
    queryFn: () => getEventRatingSummary(eventId),
    enabled: !!eventId,
    staleTime: 60_000,
  });
}

export function useEventReviews(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId, "reviews"],
    queryFn: () => getEventReviews(eventId),
    enabled: !!eventId,
  });
}

export function useMyReview(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId, "myReview"],
    queryFn: () => getMyReview(eventId),
    enabled: !!eventId,
  });
}

export function useSubmitRating(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitRatingPayload) => submitRating(eventId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId, "ratingSummary"] });
      qc.invalidateQueries({ queryKey: ["event", eventId, "reviews"] });
      qc.invalidateQueries({ queryKey: ["event", eventId, "myReview"] });
    },
  });
}

export function useUpsertReviewText(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertReviewTextPayload) => upsertReviewText(eventId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId, "reviews"] });
      qc.invalidateQueries({ queryKey: ["event", eventId, "myReview"] });
    },
  });
}


