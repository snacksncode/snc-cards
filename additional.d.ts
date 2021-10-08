interface Data {
  data: WordData[];
  id: string;
  tags: string[];
  class: "EN" | "DE" | "?MATH";
}
interface WordData {
  question: string;
  answer: string;
}
