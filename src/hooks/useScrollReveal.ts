"use client";

import { useEffect, useRef, useCallback } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );

    // Observe all .reveal children
    const observe = () => {
      el.querySelectorAll(".reveal:not(.visible)").forEach((child) => {
        observerRef.current?.observe(child);
      });
    };

    observe();

    // Re-observe when DOM changes (async data loads)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}
