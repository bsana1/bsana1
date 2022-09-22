require('intersection-observer');
import { RefObject, useEffect, useState } from "react"

export default function useOnScreen(ref: RefObject<HTMLDivElement> | undefined | null) {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    if(!ref) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting)
    )
    if(ref?.current) {
      observer.observe(ref.current)
    }
    // Remove the observer as soon as the component is unmounted
    return () => { observer.disconnect() }
  }, [])

  return isIntersecting
}