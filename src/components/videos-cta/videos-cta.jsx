"use client";
import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './videos-cta.module.css';
import GitButton from '../git-button/git-button';
import { useTranslations } from "next-intl";
import { Link as LocalizedLink } from "@/i18n/navigation";

function VideosCta({ variant, cta }) {
    const t = useTranslations("cta");
    const isCampaign = variant === 'campaign';
    const sectionRef = useRef(null);
    const videoRefs = useRef([]);
    const [hasEntered, setHasEntered] = useState(false);
    const [hasApproached, setHasApproached] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    const [paused, setPaused] = useState(false);
    const videos = [
        "/projects/allavelli/carousel/Opening.mp4",
        "/projects/gamelia/sensibilizzazione.mp4",
        "/projects/makuda/carousel/Home.mp4"
    ];
    const posters = [
        "/projects/allavelli/main.webp",
        "/projects/gamelia/carousel-2.webp",
        "/projects/makuda/main.webp"
    ];

    useEffect(() => {
        if (!isCampaign) return;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncPreference = () => setReducedMotion(preference.matches);
        syncPreference();
        preference.addEventListener('change', syncPreference);

        const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
            if (entry.isIntersecting) setHasEntered(true);
        }, { threshold: 0.05 });
        const posterObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setHasApproached(true);
            posterObserver.disconnect();
        }, { rootMargin: '200px' });
        if (posterObserver) posterObserver.observe(sectionRef.current);
        else setHasApproached(true);
        if (observer) observer.observe(sectionRef.current);
        else {
            setIsVisible(true);
            setHasEntered(true);
        }

        return () => {
            observer?.disconnect();
            posterObserver?.disconnect();
            preference.removeEventListener('change', syncPreference);
        };
    }, [isCampaign]);

    useEffect(() => {
        if (!isCampaign) return;
        videoRefs.current.forEach((video) => {
            if (!video) return;
            if (hasEntered && isVisible && !reducedMotion && !paused) video.play()?.catch(() => {});
            else video.pause();
        });
    }, [isCampaign, hasEntered, isVisible, reducedMotion, paused]);

    return (
        <section ref={sectionRef} className={`${styles.videosCtaSection} ${isCampaign ? styles.campaign : ''}`} id="videos-cta" aria-label={isCampaign ? t('closingLabel') : undefined}>

            <div className={styles.bracketsContainer}>
                {/* Fisheye Video Gallery */}

                <div className={styles.galleryWrapper}>
                    <div className={styles.gallery} aria-hidden={isCampaign ? true : undefined}>
                        {videos.map((src, index) => (
                            <div key={index} className={styles.videoCard}>
                                <video 
                                    ref={(video) => { videoRefs.current[index] = video; }}
                                    src={isCampaign ? hasEntered && !reducedMotion ? src : undefined : src}
                                    poster={isCampaign && hasApproached ? posters[index] : undefined}
                                    preload={isCampaign ? 'none' : undefined}
                                    className={styles.video} 
                                    suppressHydrationWarning
                                    autoPlay={!isCampaign}
                                    loop 
                                    muted 
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Centered CTA Button */}
                    <div className={styles.ctaCenter}>
                        {cta || <LocalizedLink href="/contacts" className={styles.buttonWrapper}>
                            <GitButton
                                text={t("connect")}
                                className={styles.ctaGitButton}
                                isLinkContent
                            />
                        </LocalizedLink>}
                    </div>
                </div>
            </div>
            {isCampaign && hasEntered && !reducedMotion && (
                <button type="button" className={styles.playbackToggle} onClick={() => setPaused((value) => !value)}>
                    {paused ? t('playVideos') : t('pauseVideos')}
                </button>
            )}
        </section>
    );
}

export default memo(VideosCta);
