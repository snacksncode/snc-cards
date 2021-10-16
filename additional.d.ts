interface Data {
  data: WordData[];
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  class: "EN" | "DE" | "MATH" | "OTHER";
}
interface WordData {
  question: string;
  answer: string;
}

declare module "shoetest";
