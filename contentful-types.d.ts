import { Entry } from "contentful";

type Class = "en" | "de" | "math" | "geo";

interface IEntryFields {
  data: IQuestion[];
  title: string;
  slug: string;
  dueDate: string;
  description: string | null;
  class: Class;
}
interface IQuestionFields {
  question: string;
  answer: string;
}

interface IQuestion extends Entry<IQuestionFields> {}
interface IEntry extends Entry<IEntryFields> {}
