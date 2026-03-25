import { useState, useEffect } from "react";

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{ width: undefined | number; height: undefined | number }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Handler to call on window resize
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Remove event listener on cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

export default useWindowSize;
