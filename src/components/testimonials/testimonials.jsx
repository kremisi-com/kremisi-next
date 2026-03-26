"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './testimonials.module.css';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Andrea Vecchi",
        role: "Real Estate Agency Owner",
        projectId: "vecchi360",
        projectTitle: "Vecchi360",
        rating: "5.0",
        date: "26 Mar, 2026",
        image: "/images/testimonials/andrea.jpg",
        text: "We entrusted Kremisi with the creation of our new website. The experience was extremely positive: beyond being satisfied with the final product, we truly enjoyed working with such a professional and responsive team.",
        tasks: ["Real Estate API", "Automation", "UI/UX Design"]
    },
    {
        id: 2,
        name: "Giuseppe Palminteri",
        role: "Vacation Rental Owner",
        projectId: "casa-palmi",
        projectTitle: "Casa Palmi",
        rating: "5.0",
        date: "24 Mar, 2026",
        image: "/images/testimonials/palmi.jpg",
        text: "A great experience with this agency: professional, available, and highly competent. They created a modern website that perfectly aligns with my needs, guiding me with care through every phase. Highly recommended!",
        tasks: ["Booking System", "Online Payments", "UI/UX Design"]
    },
    {
        id: 3,
        name: "Angela Arlotta",
        role: "Caregiver Franchise CEO",
        projectId: "gamelia",
        projectTitle: "Gamelia",
        rating: "5.0",
        date: "25 Mar, 2026",
        image: "/images/testimonials/angela.jpg",
        text: "I highly recommend them for their precision, punctuality, and professionalism. They offered great support, always available to listen to our requests and solve every situation. Heartfelt thanks!",
        tasks: ["SaaS", "Database Management", "1000+ Users"]
    },
    {
        id: 4,
        name: "Samuele Figini & Federico Monti",
        role: "Flight Dispatch Courses Founders",
        projectId: "jester",
        projectTitle: "Jester",
        rating: "5.0",
        date: "27 Mar, 2026",
        image: "/images/testimonials/jester.jpg",
        text: "Friendly, professional, and qualified! Their speed and competence impressed us. The website perfectly reflects our company's needs. They skillfully transformed every request into an effective and efficient tailor-made solution.",
        tasks: ["SaaS", "Complex Logic", "Educational Platform"]
    }
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(1);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const positionVariants = {
        top: { x: -10, y: 120, scale: 0.82, opacity: 0.35, zIndex: 1 },
        middle: { x: 50, y: 250, scale: 1, opacity: 1, zIndex: 3 },
        bottom: { x: 26, y: 431, scale: 0.9, opacity: 0.55, zIndex: 2 },
        hidden: { x: 0, y: 520, scale: 0.75, opacity: 0, zIndex: 0 }
    };

    const getPosition = (index) => {
        const n = TESTIMONIALS.length;
        const offset = (index - activeIndex + n) % n;
        if (offset === 0) return 'middle';
        if (offset === 1) return 'bottom';
        if (offset === 2) return 'hidden';
        return 'top';
    };

    return (
        <section className={styles.testimonialsSection}>
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <div className={styles.reviewsContainer}>
                        <svg className={styles.svgCurve} width="160" height="400" viewBox="0 0 160 400" style={{ overflow: 'visible' }}>
                            <path d="M 10 60 Q 140 180 30 350" stroke="currentColor" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
                        </svg>
                        <div className={styles.subtitle}>
                            <span className={styles.subtitleLine}></span>
                            WHAT CLIENTS SAY
                        </div>
                        
                        <div className={styles.reviewsList}>
                            {TESTIMONIALS.map((item, index) => {
                                const position = getPosition(index);
                                const isActive = position === 'middle';
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={false}
                                        animate={position}
                                        variants={positionVariants}
                                        transition={{
                                            duration: 0.7,
                                            ease: [0.16, 1, 0.3, 1]
                                        }}
                                        className={`${styles.reviewItem} ${isActive ? styles.active : ''}`}
                                        style={{ pointerEvents: position === 'hidden' ? 'none' : 'auto' }}
                                        onClick={() => setActiveIndex(index)}
                                        aria-hidden={position === 'hidden'}
                                    >
                                        <div className={styles.avatarWrapper}>
                                            <img src={item.image} alt={item.name} className={styles.avatar} />
                                        </div>
                                        <div className={styles.reviewMeta}>
                                            <h3 className={styles.reviewerName}>{item.name}</h3>
                                            <span className={styles.reviewerRole}>{item.role}</span>
                                            <Link 
                                                href={`/projects/${item.projectId}`} 
                                                className={styles.projectLink}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className={styles.projectValue}>{item.projectTitle}</span>
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.quoteWrapper}>
                        <span className={styles.quoteIcon}>“</span>
                        <div className={styles.quoteContainer}>
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className={styles.quoteColumn}
                                >
                                    <div className={styles.quoteRating}>
                                        <div className={styles.ratingRow}>
                                            <span className={styles.star}>★</span>
                                            <span className={styles.ratingText}>{TESTIMONIALS[activeIndex].rating} on {TESTIMONIALS[activeIndex].date}</span>
                                        </div>
                                    </div>
                                    <p className={styles.quoteText}>
                                        <span className={styles.firstLetter}>{TESTIMONIALS[activeIndex].text.charAt(0)}</span>
                                        {TESTIMONIALS[activeIndex].text.slice(1)}
                                    </p>
                                    <div className={styles.quoteTasks}>
                                        {TESTIMONIALS[activeIndex].tasks.map((task, i) => (
                                            <span key={i} className={styles.taskTag}>{task}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
