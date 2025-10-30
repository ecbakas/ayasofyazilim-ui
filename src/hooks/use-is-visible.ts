'use client';

import { useEffect, useState } from 'react';

export function useIsVisible(ref: any, threshold = 0.3) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry?.isIntersecting || false);
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}
