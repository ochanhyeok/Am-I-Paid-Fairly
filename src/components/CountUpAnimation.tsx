"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface Props {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUpAnimation({
  value,
  suffix = "%",
  duration = 1.5,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    setDisplayValue(0);
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
      {suffix}
    </span>
  );
}
