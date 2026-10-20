"use client";

import { useEffect } from "react";

// Progressive enhancement: server-rendered content is always visible, even if
// JavaScript, IntersectionObserver or the animation API is unavailable.
export default function LandingMotion() {
    useEffect(() => {
        const root = document.getElementById("automation-landing");
        if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;

        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const easing = window.getComputedStyle(root).getPropertyValue("--landing-ease").trim() || "ease-out";
        const seen = new WeakSet();
        const active = new Map();
        let observer;

        const cancelActive = () => {
            active.forEach((animation) => animation.cancel());
            active.clear();
        };

        const enter = (element) => {
            seen.add(element);
            observer.unobserve(element);
            if (document.hidden || element.contains(document.activeElement)) return;

            const opacity = Number(window.getComputedStyle(element).opacity);
            const isHeading = element.dataset.reveal === "hero";
            const delay = Math.min(120, Math.max(0, Number(element.dataset.revealDelay) || 0));
            const animation = element.animate([
                { opacity: isHeading ? opacity : opacity * 0.45, translate: "0 12px" },
                { opacity, translate: "0 0" },
            ], {
                duration: isHeading ? 600 : 520,
                delay,
                easing,
                fill: "backwards",
            });
            active.set(element, animation);
            animation.finished.then(() => active.delete(element), () => active.delete(element));
        };

        const watch = () => {
            observer?.disconnect();
            cancelActive();
            if (preference.matches) return;
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) enter(entry.target);
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });
            root.querySelectorAll("[data-reveal]").forEach((element) => {
                if (!seen.has(element)) observer.observe(element);
            });
        };

        const onFocus = (event) => {
            active.forEach((animation, element) => {
                if (element.contains(event.target)) animation.cancel();
            });
        };
        const onVisibilityChange = () => {
            if (document.hidden) cancelActive();
        };

        watch();
        preference.addEventListener("change", watch);
        root.addEventListener("focusin", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            observer?.disconnect();
            cancelActive();
            preference.removeEventListener("change", watch);
            root.removeEventListener("focusin", onFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    return null;
}
