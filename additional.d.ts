interface Data {
  data: WordData[];
  id: string;
  tags: string[];
  class: "EN" | "DE" | "?MATH" | "OTHER";
}
interface WordData {
  question: string;
  answer: string;
}
