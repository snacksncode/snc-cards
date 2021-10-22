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
