import { IEntryFields } from "contentful-types";

export default function getAccentForClass(cls: IEntryFields["class"]) {
  switch (cls) {
    case "de":
      return "var(--clr-accent-peachy)";
    case "en":
      return "var(--clr-accent-blue)";
    case "geo":
      return "var(--clr-accent-green)";
    case "math":
      return "var(--clr-accent-red)";
  }
}
