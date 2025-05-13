export type AgeGroup = "5-7" | "8-10" | "11-12";

export type CourseLength = "quick" | "standard" | "deep";

export interface LearningCard {
  id: number;
  title: string;
  content: string;
  funFact: string;
}

export interface CourseState {
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
