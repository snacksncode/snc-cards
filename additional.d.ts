interface Data {
  data: WordData[];
  id: string;
  title: string;
  description: string | null;
  // date: [number, number, number];
  tags: string[];
  class: "EN" | "DE" | "?MATH" | "OTHER";
}
interface WordData {
  question: string;
  answer: string;
}

declare module "shoetest";
