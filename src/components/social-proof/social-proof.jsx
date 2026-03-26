"use client";
import { useState, useEffect } from 'react';
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

const LogoCard = ({ className, initialIndex }) => {
    // We use two slots for images to cross-fade between them.
    // This allows us to change the 'src' of the hidden image before it fades in.
    const [indices, setIndices] = useState([
        initialIndex, 
        (initialIndex + 1) % LOGOS.length
    ]);
    const [activeSlot, setActiveSlot] = useState(0); // 0 or 1

    useEffect(() => {
        const randomStartDelay = Math.random() * 8000;
        
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                // Step 1: Switch active slot
                // The transition is handled by CSS (.active / .background)
                setActiveSlot(prev => (prev === 0 ? 1 : 0));
                
                // Step 2: After the fade is complete, update the now-hidden slot
                // with the next logo in the sequence
                setTimeout(() => {
                    setIndices(prev => {
                        const newIndices = [...prev];
                        // The hidden slot is 'prev === 0 ? 0 : 1' BEFORE the update, 
                        // but since we just swapped, it's actually '1 - current_activeSlot'
                        // Let's use the local 'newActiveSlot' logic
                        const hiddenSlot = activeSlot; // The slot that WAS active is now background
                        newIndices[hiddenSlot] = (newIndices[hiddenSlot] + 2) % LOGOS.length;
                        return newIndices;
                    });
                }, 2100); // 2100ms > 2000ms transition duration
                
            }, 6000); // Cycle every 6 seconds
            
            return () => clearInterval(interval);
        }, randomStartDelay);

        return () => clearTimeout(timeout);
    }, [activeSlot]);

    return (
        <div className={`${styles.placeholder} ${className}`}>
            <img 
                src={`/projects-logos/${LOGOS[indices[0]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 0 ? styles.active : styles.background}`}
            />
            <img 
                src={`/projects-logos/${LOGOS[indices[1]]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${activeSlot === 1 ? styles.active : styles.background}`}
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
