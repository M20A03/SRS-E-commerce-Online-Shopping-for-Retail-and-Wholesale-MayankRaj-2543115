import { useEffect, useRef } from 'react';

// Hook for Intersection Observer scroll reveal
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// Hook for counter animation
export function useCounter(target, inView) {
  const ref = useRef(null);
  useEffect(() => {
    if (!inView || !ref.current) return;
    const isFloat = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();
    const el = ref.current;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const val = target * ease;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }, [inView, target]);
  return ref;
}
