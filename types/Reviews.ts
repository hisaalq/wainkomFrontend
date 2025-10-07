export interface ReviewUserLite {
  _id: string;
  name?: string;
  email?: string;
}

export interface Review {
  _id: string;
  eventId: string;
  userId: string | ReviewUserLite;
  rating: number;
  text?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  ratingsCount: number;
}

export interface SubmitRatingPayload {
  rating: number;
  text?: string;
}

export interface SubmitRatingResponse {
  message: string;
  review: Review;
}

export interface UpsertReviewTextPayload {
  text?: string;
}


