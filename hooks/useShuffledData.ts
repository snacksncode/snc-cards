import shuffle from "@utils/shuffle";
import { useEffect, useState } from "react";

const useShuffledData = <T>(initialData: T[], reshuffleTrigger: any) => {
  const [shuffledData, setShuffledData] = useState<T[]>(initialData);
  useEffect(() => {
    const shuffled = shuffle(initialData);
    setShuffledData(shuffled);
  }, [initialData, reshuffleTrigger]);
  return {
    data: shuffledData,
  };
};
export default useShuffledData;
