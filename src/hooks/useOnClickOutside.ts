import { RefObject, useEffect } from "react";

// Hook
const useOnClickOutside = (ref: RefObject<HTMLElement>, handler: CallableFunction) => {
  useEffect(
    () => {
      const listener = (event: any): any => {
        const refHtmlElement: HTMLElement | null = ref?.current;
        const clickedHtmlElement: HTMLElement | undefined = event?.target as HTMLElement;

        // Do nothing if clicking ref's element or descendent elements
        if (!refHtmlElement || refHtmlElement.contains(clickedHtmlElement as Node)) {
          return;
        }
        handler();
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },

    [ref, handler]
  );
}

export default useOnClickOutside;