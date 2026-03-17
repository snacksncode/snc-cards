import { useReducer } from "react";

type State = { streak: number; maxStreak: number };
type Action =
  | { type: "set"; value: number | ((prev: number) => number) }
  | { type: "reset" };

function streakReducer(state: State, action: Action): State {
  if (action.type === "reset") return { streak: 0, maxStreak: 0 };
  const next = typeof action.value === "function" ? action.value(state.streak) : action.value;
  return { streak: next, maxStreak: Math.max(state.maxStreak, next) };
}

function useStreak() {
  const [{ streak, maxStreak }, dispatch] = useReducer(streakReducer, { streak: 0, maxStreak: 0 });
  const setStreak = (value: number | ((prev: number) => number)) => dispatch({ type: "set", value });
  const reset = () => dispatch({ type: "reset" });
  return [streak, setStreak, maxStreak, reset] as const;
}

export default useStreak;
