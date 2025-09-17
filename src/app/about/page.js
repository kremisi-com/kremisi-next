"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
import styles from "./about.module.css";

export default function AboutPage() {
    const sectionRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const el = textRef.current;
        if (!el) return;

        // Split solo in PAROLE per l'entrata
        const split = new SplitType(el, { types: "words" });

        // Mostra il blocco solo quando le parole animate sono pronte
        gsap.set(el, { autoAlpha: 1 });

        // Scopo GSAP per evitare duplicazioni in StrictMode
        const ctx = gsap.context(() => {
            gsap.fromTo(
                split.words,
                { yPercent: 100, opacity: 0 }, // stato iniziale
                {
                    yPercent: 0,
                    opacity: 1, // stato finale esplicito
                    duration: 0.35,
                    ease: "power3.out",
                    stagger: 0.04,
                    scrollTrigger: {
                        trigger: sectionRef.current || el,
                        start: "top 80%",
                        once: true,
                    },
                }
            );
        }, sectionRef);

        return () => {
            ctx.revert(); // pulisce le animazioni nel contesto
            gsap.set(el, { clearProps: "all" });
            split.revert(); // ripristina il DOM originale
        };
    }, []);

    return (
        <main className={`${styles.main} page-content`}>
            <section ref={sectionRef} className={styles.section}>
                <p
                    ref={textRef}
                    className={`${styles.text} ${styles.hideUntilAnimated}`}
                >
                    Lorem ipsum dolor sit amet, consectetur adipisci elit, sed
                    eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrum exercitationem ullam
                    corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                    consequatur. Quis aute iure reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    obcaecat cupiditat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>
            </section>
            <section className={styles.section}>
                <p className={styles.text}>
                    Lorem ipsum dolor sit amet, consectetur adipisci elit, sed
                    eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrum exercitationem ullam
                    corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                    consequatur. Quis aute iure reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    obcaecat cupiditat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>
            </section>
        </main>
    );
}
