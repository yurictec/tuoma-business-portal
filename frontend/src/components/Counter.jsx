import React, { useEffect, useRef, useState } from "react";

/**
 * Animated counter that starts when scrolled into view.
 * Props:
 *  - to: target value (number)
 *  - from: starting value (default 0)
 *  - duration: ms (default 1400)
 *  - format: optional fn(value) => string
 *  - suffix / prefix
 */
export default function Counter({ to, from = 0, duration = 1400, format, prefix = "", suffix = "", testid }) {
  const [value, setValue] = useState(from);
  const ref = useRef(null);
  const started = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setValue(from + (to - from) * eased);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, from, duration]);

  const display = format ? format(value) : Math.round(value).toLocaleString("pl-PL");
  return (
    <span ref={ref} data-testid={testid}>
      {prefix}{display}{suffix}
    </span>
  );
}
