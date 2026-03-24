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
    const [indices, setIndices] = useState({
        current: initialIndex,
        next: (initialIndex + 1) % LOGOS.length
    });
    const [isFading, setIsFading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        // Shuffle the logos for each card to avoid all showing the same cycle
        const randomStartDelay = Math.random() * 8000;
        
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                // Step 1: Start fading in the next image over the current one
                setIsFading(true);

                // Step 2: Wait for transition to complete
                setTimeout(() => {
                    // Step 3: Update base image to the next logo
                    setIndices(prev => ({
                        current: prev.next,
                        next: (prev.next + 1) % LOGOS.length
                    }));
                    
                    // Step 4: Instantly hide the overlay and disable transitions
                    setIsResetting(true);
                    setIsFading(false);
                    
                    // Step 5: After a short delay to ensure DOM update, re-enable transitions
                    setTimeout(() => {
                        setIsResetting(false);
                    }, 50);
                }, 2000); // Matches CSS transition duration
                
            }, 6000); // Cycle every 6 seconds
            
            return () => clearInterval(interval);
        }, randomStartDelay);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className={`${styles.placeholder} ${className}`}>
            <img 
                src={`/projects-logos/${LOGOS[indices.current]}`} 
                alt="Logo" 
                className={styles.logoImage}
            />
            <img 
                src={`/projects-logos/${LOGOS[indices.next]}`} 
                alt="Logo" 
                className={`${styles.logoImage} ${styles.overlayImage} ${isFading ? styles.visible : ''} ${isResetting ? styles.reset : ''}`}
            />
        </div>
    );
};


export default function SocialProof() {
    return (
        <section className={styles.socialProofSection} id="social-proof">
            <div className={styles.gallery}>
                <div className={styles.galleryInner}>
                    <LogoCard className={styles.p1} initialIndex={0} />
                    <LogoCard className={styles.p2} initialIndex={3} />
                    <LogoCard className={styles.p3} initialIndex={6} />
                    <LogoCard className={styles.p4} initialIndex={9} />
                    <LogoCard className={styles.p5} initialIndex={12} />
                    <LogoCard className={styles.p6} initialIndex={15} />
                    <LogoCard className={styles.p7} initialIndex={18} />
                    <LogoCard className={styles.p8} initialIndex={21} />
                    <LogoCard className={styles.p9} initialIndex={24} />
                    <LogoCard className={styles.p10} initialIndex={27} />
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.badge}>Customers</div>
                
                <h2 className={styles.title}>
                    Trusted by founders<br/>
                    <span className={styles.titleLight}>building real products</span>
                </h2>
                
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
