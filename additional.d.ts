declare module "shoetest";
interface APIData {
  id: number;
  title: string;
  slug: string;
  class: ClassString;
  description: string;
  dueDate: string;
  questionData: QuestionData[];

  created_at: string;
  published_at: string;
  updated_at: string;
}

type ClassString = "en" | "de" | "math" | "geo";

interface QuestionData {
  id: number;
  question: string;
  answer: string;
}

interface SpellingData {
  input: string;
  expected: string;
  data: QuestionData;
}

interface SpellingReviewData {
  incorrect: SpellingData[];
  correct: SpellingData[];
}

interface CardsReviewData {
  incorrect: QuestionData[];
  correct: QuestionData[];
}
