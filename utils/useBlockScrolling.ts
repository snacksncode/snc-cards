import { useEffect, useState } from "react";

const useBlockScrolling = (initial: boolean = false) => {
  const [isBlocked, setIsBlocked] = useState(initial);
  useEffect(() => {
    const scrollState = isBlocked ? "hidden" : "auto";
    document.body.style.overflowY = scrollState;
  }, [isBlocked]);
  return setIsBlocked;
};

export default useBlockScrolling;
