import { useEffect, useState } from "react";

function useStreak() {
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  useEffect(() => {
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
  }, [streak, maxStreak]);
  return [streak, setStreak, maxStreak] as const;
}
export default useStreak;
