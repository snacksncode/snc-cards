export default function getAccentForClass(cls: Data["class"]) {
  switch (cls) {
    case "DE":
      return "var(--clr-accent-peachy)";
    case "EN":
      return "var(--clr-accent-blue)";
    case "OTHER":
      return "var(--clr-accent-green)";
    default:
      return "var(--clr-accent-red)";
  }
}
