export default function getHumanReadableClass(cls: ClassString) {
  switch (cls) {
    case "de":
      return "German";
    case "en":
      return "English";
    case "geo":
      return "Geography";
    case "math":
      return "Math";
  }
}
