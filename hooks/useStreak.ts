import { useEffect, useState } from "react";

function useStreak() {
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  useEffect(() => {
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
  }, [streak, maxStreak]);
  const reset = () => {
    setStreak(0);
    setMaxStreak(0);
  };
  return [streak, setStreak, maxStreak, reset] as const;
}
export default useStreak;
