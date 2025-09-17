"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";
import styles from "./about.module.css";

export default function AboutPage() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // 1) Split del testo in parole
        const split = new SplitType(`.${styles.text}`, { types: "words" });

        // 2) Per ogni parola, clono il testo in un overlay bianco con width:0
        split.words.forEach((word) => {
            // base parola grigia (gestita via CSS globale :global(.word))
            const overlay = document.createElement("span");
            overlay.className = styles.reveal; // classe hashata del modulo
            overlay.textContent = word.textContent; // stesso testo
            word.appendChild(overlay); // overlay sopra alla parola
        });

        // 3) Entrata delle parole (dal basso verso l'alto, con leggero stagger)
        const enterTl = gsap.from(split.words, {
            yPercent: 100,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.03,
            scrollTrigger: {
                trigger: `.${styles.section}`,
                start: "top 80%",
            },
        });

        // 4) Reveal da sinistra verso destra: aumento width dell'overlay bianco
        const revealer = [];
        split.words.forEach((word) => {
            const overlay = word.querySelector(`.${styles.reveal}`);
            if (!overlay) return;

            revealer.push(
                gsap.to(overlay, {
                    width: "100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: word,
                        start: "top 90%",
                        end: "top 30%",
                        scrub: true,
                    },
                })
            );
        });

        // Cleanup su unmount: kill triggers e ripristina DOM
        return () => {
            revealer.forEach((a) => a.kill());
            enterTl?.kill();
            ScrollTrigger.getAll().forEach((t) => t.kill());
            split.revert();
        };
    }, []);

    return (
        <main className={styles.main}>
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
            <section className={styles.section}>
                <p className={styles.text}>
                    Anche questo blocco ha lo stesso effetto elegante e
                    progressivo.
                </p>
            </section>
        </main>
    );
}
