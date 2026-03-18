import { useState } from "react";

const useIndexSelectedData = <T>(dataArray: T[] | undefined, startingIndex?: number) => {
  const [selectedIndex, setSelectedIndex] = useState(startingIndex || 0);
  const [isDone, setIsDone] = useState(false);
  const selectedItem = dataArray?.[selectedIndex];
  const amountOfItems = dataArray?.length ?? 0;
  const nextItem = () => {
    if (dataArray == null) return;
    setSelectedIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= dataArray.length) {
        setIsDone(true);
        return i;
      }
      return nextIndex;
    });
  };
  const prevItem = () => {
    if (dataArray == null) return;
    if (isDone === true) setIsDone(false);
    setSelectedIndex((i) => {
      const prevIndex = i - 1;
      if (prevIndex < 0) return 0;
      return prevIndex;
    });
  };
  const resetIndex = () => {
    setIsDone(false);
    setSelectedIndex(startingIndex || 0);
  };

  const jumpToIndex = (index: number) => {
    if (dataArray == null) return;
    if (index >= dataArray.length) {
      setIsDone(true);
      setSelectedIndex(dataArray.length - 1);
    } else {
      setSelectedIndex(Math.max(0, index));
    }
  };

  return {
    selectedItem,
    selectedIndex,
    amountOfItems,
    progress: {
      isDone,
      isFirst: selectedIndex === 0,
      isLast: (dataArray && selectedIndex === dataArray.length - 1) || false,
    },
    nextItem,
    prevItem,
    resetIndex,
    jumpToIndex,
  };
};

export default useIndexSelectedData;
