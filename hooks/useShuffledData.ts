import { shuffle } from "@lib/utils";
import { useEffect, useState } from "react";

function weightedShuffle<T extends { id: number }>(
  arr: T[],
  stats: Record<number, { correct: number; incorrect: number }>
): T[] {
  const weighted = arr.map((item) => {
    const s = stats[item.id];
    const weight = s ? 1 + s.incorrect / (s.correct + 1) : 1;
    return { item, sort: -weight + Math.random() * 0.5 };
  });
  return weighted.sort((a, b) => a.sort - b.sort).map((w) => w.item);
}

const useShuffledData = <T extends { id: number }>(
  data: T[],
  cardStats?: Record<number, { correct: number; incorrect: number }>
) => {
  const [shuffledData, setShuffledData] = useState(data);
  const [isShuffled, setIsShuffled] = useState(false);

  const doShuffle = (items: T[]) =>
    cardStats && Object.keys(cardStats).length > 0
      ? weightedShuffle(items, cardStats)
      : shuffle(items);

  const reshuffle = (newData: T[] | null = null) => {
    setShuffledData(() => {
      return doShuffle(newData == null ? shuffledData : newData);
    });
  };

  useEffect(() => {
    setShuffledData(doShuffle(data));
    setIsShuffled(true);
  }, [data]);

  return {
    data: shuffledData,
    isShuffled,
    reshuffle,
  };
};

export default useShuffledData;
