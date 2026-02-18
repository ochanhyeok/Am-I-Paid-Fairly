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
  // 초기값을 최종 값으로 설정 → SSR/CSR 모두 최종 값 렌더링 → CLS 제거
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // 애니메이션 시작: 0에서 최종 값까지 카운트업
    // 첫 프레임에서 0으로 설정하지 않고, animate의 onUpdate가 즉시 호출되므로
    // 레이아웃 시프트 없이 부드럽게 전환됨
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
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {displayValue}
      {suffix}
    </span>
  );
}
