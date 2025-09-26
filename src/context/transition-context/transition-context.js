"use client";
import { createContext, useContext, useState } from "react";
import style from "./transition-context.module.css";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
    const [isAnimating, setIsAnimating] = useState(false);

    function triggerAnimation() {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600); // durata animazione
    }

    return (
        <TransitionContext.Provider value={{ isAnimating, triggerAnimation }}>
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
