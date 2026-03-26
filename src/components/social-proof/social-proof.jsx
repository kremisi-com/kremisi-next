"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from './social-proof.module.css';
import GitButton from '../git-button/git-button';

const LOGOS = [
    "beyond-reiki.png", "bioli.png", "ccom.png", "chora-full.png", "chora.png",
    "crystal.png", "e2l-2.png", "e2l.png", "fa.png", "fleder.jpg",
    "gamelia.png", "glapix.png", "godo.png", "ims-2.png", "ims.png",
    "jester-2.png", "jester.png", "makuda.png", "narai.png", "naturalia.png",
    "obm.png", "pc.png", "sgs-2.png", "sgs.png", "ssb.png",
    "studylux.png", "theorica.png", "vecchi360.png"
];

const LOGO_CYCLE_DELAY = 6000;
const LOGO_FADE_DURATION = 1400;
const LOGO_FADE_BUFFER = 120;

const LogoCard = ({ className, initialIndex }) => {
    const startDelay = useMemo(() => Math.random() * 8000, []);
    const [indices, setIndices] = useState([
        initialIndex,
        (initialIndex + 1) % LOGOS.length
    ]);
    const [activeSlot, setActiveSlot] = useState(0);
    const activeSlotRef = useRef(0);
    const cycleTimeoutRef = useRef(null);
    const swapTimeoutRef = useRef(null);

    useEffect(() => {
        const preloadedImages = LOGOS.map((logo) => {
            const image = new window.Image();
            image.src = `/projects-logos/${logo}`;
            return image;
        });

        return () => {
            preloadedImages.forEach((image) => {
                image.onload = null;
                image.onerror = null;
            });
        };
    }, []);

    useEffect(() => {
        const clearTimers = () => {
            if (cycleTimeoutRef.current) {
                window.clearTimeout(cycleTimeoutRef.current);
                cycleTimeoutRef.current = null;
            }

            if (swapTimeoutRef.current) {
                window.clearTimeout(swapTimeoutRef.current);
                swapTimeoutRef.current = null;
            }
        };

        const scheduleCycle = () => {
            clearTimers();

            cycleTimeoutRef.current = window.setTimeout(() => {
                const currentActiveSlot = activeSlotRef.current;
                const nextActiveSlot = currentActiveSlot === 0 ? 1 : 0;

                setActiveSlot(nextActiveSlot);
                activeSlotRef.current = nextActiveSlot;

                swapTimeoutRef.current = window.setTimeout(() => {
                    setIndices((prevIndices) => {
                        const nextIndices = [...prevIndices];
                        nextIndices[currentActiveSlot] = (nextIndices[currentActiveSlot] + 2) % LOGOS.length;
                        return nextIndices;
                    });

                    scheduleCycle();
                }, LOGO_FADE_DURATION + LOGO_FADE_BUFFER);
            }, activeSlotRef.current === 0 ? startDelay : LOGO_CYCLE_DELAY);
        };

        scheduleCycle();

        return () => {
            clearTimers();
        };
    }, [startDelay]);

    return (
        <div className={`${styles.placeholder} ${className}`}>
            <img 
                src={`/projects-logos/${LOGOS[indices[0]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 0 ? styles.active : styles.background}`}
                decoding="async"
                draggable="false"
            />
            <img 
                src={`/projects-logos/${LOGOS[indices[1]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 1 ? styles.active : styles.background}`}
                decoding="async"
                draggable="false"
            />
        </div>
    );
};


export default function SocialProof() {
    return (
        <section className={styles.socialProofSection} id="social-proof">
            <div className={styles.container}>
                <div className={styles.badge}>Customers</div>
                
                <div className={styles.galleryTop}>
                    <div className={styles.galleryInner}>
                        <LogoCard className={styles.p1} initialIndex={0} />
                        <LogoCard className={styles.p2} initialIndex={3} />
                        <LogoCard className={styles.p3} initialIndex={6} />
                        <LogoCard className={styles.p4} initialIndex={9} />
                        <LogoCard className={styles.p5} initialIndex={12} />
                        <LogoCard className={styles.p6} initialIndex={15} />
                    </div>
                </div>

                <h2 className={styles.title}>
                    Trusted by founders<br/>
                    <span className={styles.titleLight}>building real products</span>
                </h2>

                <div className={styles.galleryBottom}>
                    <div className={styles.galleryInner}>
                        <LogoCard className={styles.p7} initialIndex={18} />
                        <LogoCard className={styles.p8} initialIndex={21} />
                        <LogoCard className={styles.p9} initialIndex={24} />
                    </div>
                </div>
                
                <p className={styles.description}>
                    We design, build and scale<br/>digital products end-to-end.
                </p>
                
                <Link href="/contacts" className={styles.buttonWrapper}>
                    <GitButton text="Let's Meet" className={styles.socialProofGitButton} leftShift="-20px" />
                </Link>
            </div>
        </section>
    );
}
