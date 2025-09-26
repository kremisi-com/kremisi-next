"use client";
import { createContext, useContext, useEffect, useState } from "react";
import style from "./transition-context.module.css";
import { usePathname } from "next/navigation";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isClosable, setIsClosable] = useState(false);
    const path = usePathname();

    function triggerAnimation() {
        setIsAnimating(true);
    }
    function openLoader() {
        setIsAnimating(true);
        setIsClosable(false);
        setTimeout(() => setIsClosable(true), 600);
    }
    function closeLoader() {
        setIsAnimating(false);
    }

    useEffect(
        function () {
            if (!isClosable) return;
            closeLoader();
        },
        [path, isClosable]
    );

    return (
        <TransitionContext.Provider
            value={{ isAnimating, triggerAnimation, openLoader, closeLoader }}
        >
            {children}
            <div
                className={`${style.transitionOverlay} ${
                    isAnimating ? style.active : ""
                }`}
            ></div>
        </TransitionContext.Provider>
    );
}

export function useTransitionContext() {
    return useContext(TransitionContext);
}
