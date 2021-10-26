import shuffle from "@utils/shuffle";
import { useEffect, useRef, useState } from "react";

const useShuffledData = <T>(initialData: T[], reshuffleTrigger: any) => {
  const [shuffledData, setShuffledData] = useState<T[]>(initialData);
  const isShuffled = useRef(false);
  useEffect(() => {
    const shuffled = shuffle(shuffledData);
    setShuffledData(shuffled);
    isShuffled.current = true;
  }, [shuffledData, reshuffleTrigger]);
  return {
    data: shuffledData,
    isShuffled: isShuffled.current,
  };
};
export default useShuffledData;
