export default function getAccentForClass(cls: ClassString) {
  switch (cls) {
    case "de":
      return "var(--clr-accent-peachy)";
    case "en":
      return "var(--clr-accent-blue)";
  }
}
