import shuffle from "@utils/shuffle";
import { useEffect, useState } from "react";

const useShuffledData = <T>(data: T[]) => {
  const [shuffledData, setShuffledData] = useState(data);
  const [isShuffled, setIsShuffled] = useState(false);
  const reshuffle = (newData: T[] | null = null) => {
    setShuffledData(() => {
      return shuffle(newData == null ? shuffledData : newData);
    });
  };

  useEffect(() => {
    setShuffledData(shuffle(data));
    setIsShuffled(true);
  }, [data]);

  return {
    data: shuffledData,
    isShuffled,
    reshuffle,
  };
};

export default useShuffledData;
