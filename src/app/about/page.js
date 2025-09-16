"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function AboutPage() {
    useEffect(() => {
        // registra il plugin una sola volta
        gsap.registerPlugin(ScrollTrigger);

        // seleziona tutti gli elementi con classe .word
        gsap.utils.toArray(".word").forEach((el) => {
            gsap.fromTo(
                el,
                { color: "#555" }, // colore iniziale
                {
                    color: "#fff", // colore finale
                    scrollTrigger: {
                        trigger: el,
                        start: "top 80%", // quando entra nell'80% viewport
                        end: "top 20%", // fino al 20%
                        scrub: true, // l'animazione segue lo scroll
                    },
                }
            );
        });
    }, []);

    return (
        <main className="px-10 py-20 bg-black text-gray-500">
            <section className="h-screen flex items-center justify-center">
                <p className="word text-4xl font-bold">
                    Questo testo diventa bianco mentre scrolli
                </p>
            </section>
            <section className="h-screen flex items-center justify-center">
                <p className="word text-4xl font-bold">
                    Anche questo cambia colore gradualmente
                </p>
            </section>
        </main>
    );
}
