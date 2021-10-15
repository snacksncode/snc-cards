function shuffle<T>(a: T[]) {
  const aC = a.slice();
  for (let i = aC.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [aC[i], aC[j]] = [aC[j], aC[i]];
  }
  return aC;
}

export default shuffle;
