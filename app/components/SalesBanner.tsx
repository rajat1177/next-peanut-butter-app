"use client";

import { useEffect, useRef } from "react";

export default function SalesBanner() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    // ⭐ Guaranteed non-null div
    const div = el as HTMLDivElement;

    let offset = 0;

    function animate() {
      offset -= 1; // speed

      div.style.transform = `translateX(${offset}px)`;

      if (Math.abs(offset) > div.scrollWidth / 2) {
        offset = 0;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div className="w-full bg-black border-y border-orange-500 overflow-hidden h-10 flex items-center">
      <div
        ref={marqueeRef}
        className="flex whitespace-nowrap text-orange-400 font-semibold text-sm tracking-wide"
      >
        {Array(10)
          .fill("🔥 Limited Time Offer — Flat 20% OFF on All Peanut Butter — Shop Now! 🔥")
          .map((text, index) => (
            <span key={index} className="px-10">
              {text}
            </span>
          ))}
      </div>
    </div>
  );
}
