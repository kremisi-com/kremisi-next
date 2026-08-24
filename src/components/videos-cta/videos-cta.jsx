"use client";
import React from 'react';
import styles from './videos-cta.module.css';
import GitButton from '../git-button/git-button';
import { useTranslations } from "next-intl";
import { Link as LocalizedLink } from "@/i18n/navigation";

export default function VideosCta() {
    const t = useTranslations("cta");
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
                                    suppressHydrationWarning
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
                        <LocalizedLink href="/contacts" className={styles.buttonWrapper}>
                            <GitButton text={t("connect")} className={styles.ctaGitButton} />
                        </LocalizedLink>
                    </div>
                </div>
            </div>
        </section>
    );
}
