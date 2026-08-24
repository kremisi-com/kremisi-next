"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import style from "./transition-context.module.css";
import { usePathname } from "next/navigation";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isCovered, setIsCovered] = useState(false);
    const [isRouteReady, setIsRouteReady] = useState(false);
    const navigationStartPath = useRef(null);
    const path = usePathname();

    function triggerAnimation() {
        openLoader();
    }

    function openLoader() {
        navigationStartPath.current = path;
        setIsCovered(false);
        setIsRouteReady(false);
        setIsAnimating(true);
    }

    function closeLoader() {
        setIsAnimating(false);
        setIsCovered(false);
        setIsRouteReady(false);
        navigationStartPath.current = null;
    }

    useEffect(() => {
        if (!isAnimating || navigationStartPath.current === path) return;

        // usePathname changes only after Next.js has committed the new route.
        setIsRouteReady(true);
    }, [isAnimating, path]);

    useEffect(() => {
        if (!isCovered || !isRouteReady) return;
        setIsAnimating(false);
    }, [isCovered, isRouteReady]);

    function handleTransitionEnd(event) {
        if (event.propertyName !== "transform" || !isAnimating) return;
        setIsCovered(true);
    }

    return (
        <TransitionContext.Provider
            value={{ isAnimating, triggerAnimation, openLoader, closeLoader }}
        >
            {children}
            <div
                className={`${style.transitionOverlay} ${
                    isAnimating ? style.active : ""
                }`}
                onTransitionEnd={handleTransitionEnd}
                aria-hidden="true"
            ></div>
        </TransitionContext.Provider>
    );
}

export function useTransitionContext() {
    return useContext(TransitionContext);
}
