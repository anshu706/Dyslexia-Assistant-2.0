import { useState, useEffect } from 'react';

/**
 * Hook to detect reduced motion preference.
 * Respects both system accessibility settings (prefers-reduced-motion)
 * and an explicit user toggle stored in preferences.
 * @param {boolean} userOverride - Optional user preference toggle
 */
export function useReducedMotion(userOverride = false) {
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setSystemReducedMotion(e.matches);

    // Modern and legacy event listener fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return Boolean(userOverride || systemReducedMotion);
}
