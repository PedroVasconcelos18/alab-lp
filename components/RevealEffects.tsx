"use client";

import { useEffect } from "react";

/**
 * Porta o <script> da LP original (index.html, linhas 2320-2356):
 * reveal-on-scroll via IntersectionObserver, stagger de delays e shrink do nav.
 * Comportamento idêntico ao original. Não renderiza nada.
 */
export default function RevealEffects() {
  useEffect(() => {
    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // Stagger reveal in hero/phases
    document.querySelectorAll<HTMLElement>(".hero .reveal").forEach((el, i) => {
      el.style.transitionDelay = i * 0.08 + "s";
    });
    document
      .querySelectorAll<HTMLElement>(".phases .reveal")
      .forEach((el, i) => {
        el.style.transitionDelay = i * 0.1 + "s";
      });
    document
      .querySelectorAll<HTMLElement>(".why-grid .reveal")
      .forEach((el, i) => {
        el.style.transitionDelay = i * 0.06 + "s";
      });

    // Nav shrink on scroll
    const nav = document.querySelector<HTMLElement>(".nav");
    const onScroll = () => {
      if (!nav) return;
      nav.style.padding = window.scrollY > 20 ? "12px 0" : "18px 0";
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
