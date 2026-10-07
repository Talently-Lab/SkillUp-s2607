export type StarValue = 1 | 2 | 3 | 4 | 5;

export type StarCounts = Record<StarValue, number>;

export interface Review {
  id: string;
  courseId: string;
  authorName: string;
  rating: StarValue;
  text: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  counts: StarCounts;
}
