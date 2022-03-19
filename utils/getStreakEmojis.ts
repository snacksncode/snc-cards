function getStreakEmojis(streak: number): string {
  let multiplicator = 1;
  if (streak >= 20) multiplicator = 2;
  if (streak >= 40) multiplicator = 3;
  if (streak >= 80) multiplicator = 4;
  if (streak >= 160) multiplicator = 5;
  return "🔥".repeat(multiplicator);
}

export default getStreakEmojis;
