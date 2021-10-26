import { getRefElement } from "@utils/getRefElement";
import { isSSR } from "@utils/isSSR";
import { RefObject, useRef, useEffect, useCallback } from "react";

interface UseEventListener {
  type: keyof WindowEventMap;
  listener: EventListener;
  element?: RefObject<Element> | Document | Window | null;
  options?: AddEventListenerOptions;
}

const useEventListener = ({
  type,
  listener,
  element = isSSR ? undefined : window,
  options,
}: UseEventListener): void => {
  const savedListener = useRef<EventListener>();

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  const handleEventListener = useCallback((event: Event) => {
    savedListener.current?.(event);
  }, []);

  useEffect(() => {
    const target = getRefElement(element);
    target?.addEventListener(type, handleEventListener, options);
    return () => target?.removeEventListener(type, handleEventListener);
  }, [type, element, options, handleEventListener]);
};

export default useEventListener;
