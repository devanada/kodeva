import { useCallback, useEffect, useRef, useState } from 'react';

// True once the referenced element is within `rootMargin` of the viewport (and stays true). Used to defer heavy third-party
// widgets, such as the captcha, until the visitor is about to reach them: a phone visitor who never scrolls to the form
// should not download it. `activate` flips it early, for example when a field receives focus.
export function useNearViewport<T extends Element>(rootMargin = '600px 0px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  const activate = useCallback(() => setNear(true), []);

  useEffect(() => {
    const node = ref.current;

    if (near || !node) {
      return;
    }

    // very old browsers have no IntersectionObserver: load right away rather than never
    if (typeof IntersectionObserver === 'undefined') {
      const timer = window.setTimeout(activate, 0);

      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [near, rootMargin, activate]);

  return { ref, near, activate };
}
