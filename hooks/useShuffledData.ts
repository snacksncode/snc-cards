import shuffle from "@utils/shuffle";
import { useEffect, useState } from "react";

const useShuffledData = <T>(initialData: T[] | undefined) => {
  const [shuffledData, setShuffledData] = useState<typeof initialData>(initialData);
  const [shuffleId, setShuffleId] = useState(Math.random());
  const [isShuffled, setIsShuffled] = useState(false);
  const reshuffle = () => setShuffleId(Math.random());

  useEffect(() => {
    if (initialData == null) return;

    const shuffled = shuffle(initialData);
    setShuffledData(shuffled);
  }, [initialData, shuffleId]);

  useEffect(() => {
    setIsShuffled(true);
  }, [shuffledData]);

  return {
    data: shuffledData,
    isShuffled,
    reshuffle,
  };
};

export default useShuffledData;
