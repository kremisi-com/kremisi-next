"use client";
import React from 'react';
import styles from './videos-cta.module.css';
import GitButton from '../git-button/git-button';
import Link from 'next/link';

export default function VideosCta() {
    const videos = [
        "/projects/allavelli/carousel/Opening.mp4",
        "/projects/gamelia/sensibilizzazione.mp4",
        "/projects/makuda/carousel/Home.mp4"
    ];

    return (
        <section className={styles.videosCtaSection} id="videos-cta">

            <div className={styles.bracketsContainer}>
                {/* Fisheye Video Gallery */}

                <div className={styles.galleryWrapper}>
                    <div className={styles.gallery}>
                        {videos.map((src, index) => (
                            <div key={index} className={styles.videoCard}>
                                <video 
                                    src={src} 
                                    className={styles.video} 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Centered CTA Button */}
                    <div className={styles.ctaCenter}>
                        <Link href="/contacts" className={styles.buttonWrapper}>
                            <GitButton text="Let's Connect" className={styles.ctaGitButton} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
