declare module "shoetest";
interface CardFields {
  id: number;
  title: string;
  slug: string;
  class: ClassString;
  questions: Question[];

  createdAt: string;
  publishedAt: string;
  updatedAt: string;
}

type Card = { id: number; attributes: CardFields };

type ApiResponse = {
  data: Card[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

type ClassString = "en" | "de" | "geo";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface SpellingData {
  input: string;
  expected: string;
  data: Question;
}

interface SpellingReviewData {
  incorrect: SpellingData[];
  correct: SpellingData[];
}

interface CardsReviewData {
  incorrect: Question[];
  correct: Question[];
}
