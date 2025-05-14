export type AgeGroup = "5-7" | "8-10" | "11-12";

export type CourseLength = "quick" | "standard" | "deep";

export interface LearningCard {
  id: number;
  title: string;
  content: string;
  funFact: string;
}

export interface Course {
  id: number;
  topic: string;
  ageGroup: string;
  courseLength: string;
  cards: any; // Using any for storing the serialized cards in the database
  userId: number | null;
  saved: boolean | null;
  createdAt: string;
  lastViewedAt?: string | null;
  currentCardIndex?: number | null;
}

export interface CourseState {
  id?: number;
  topic: string;
  ageGroup: AgeGroup | null;
  courseLength: CourseLength | null;
  cards: LearningCard[];
  currentCardIndex: number;
  isLoading: boolean;
  totalCards: number;
}

export interface GenerateCardsRequest {
  topic: string;
  ageGroup: AgeGroup;
  courseLength: CourseLength;
}

export interface GenerateCardsResponse {
  cards: LearningCard[];
}
