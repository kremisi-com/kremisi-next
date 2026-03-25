"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './testimonials.module.css';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Diana Johnston",
        rating: "4.9",
        date: "29 Aug, 2017",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "The experience was incredibly smooth from start to finish. I highly recommend them to anyone looking for top-tier service."
    },
    {
        id: 2,
        name: "Lauren Contreras",
        rating: "4.9",
        date: "29 Aug, 2017",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        text: "Been working with appscrip for a number of years now with a variety of different apps. They have my recommendation. They are a great team."
    },
    {
        id: 3,
        name: "Edward Alexander",
        rating: "4.9",
        date: "29 Aug, 2017",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Outstanding communication and delivery. They exceeded expectations in every single metric. Will definitely work with them again."
    },
    {
        id: 4,
        name: "Sophia Martinez",
        rating: "5.0",
        date: "12 Oct, 2017",
        image: "https://randomuser.me/api/portraits/women/24.jpg",
        text: "They are true partners in innovation. Their technical expertise combined with their design sense is unparalleled."
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

    // Get the visible indices based on activeIndex
    // We want to show a window of 3 people around the active index
    // But since we want "one of them disappears at each turn", we only map those who are "near" the active one or just rotate them all.
    // The user said "4 people, one of them disappears in turn". 
    // This implies a carousel of 4 where 3 are visible.
    
    // We'll calculate the 3 visible positions relative to the infinite rotation
    const getVisibleTestimonials = () => {
        const n = TESTIMONIALS.length;
        const prev = (activeIndex - 1 + n) % n;
        const next = (activeIndex + 1) % n;
        return [
            { item: TESTIMONIALS[prev], pos: 'top' },
            { item: TESTIMONIALS[activeIndex], pos: 'middle' },
            { item: TESTIMONIALS[next], pos: 'bottom' }
        ];
    };

    return (
        <section className={styles.testimonialsSection}>
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <div className={styles.header}>
                        <div className={styles.subtitle}>
                            <span className={styles.subtitleLine}></span>
                            TESTIMONIALS
                        </div>
                        <h2 className={styles.title}>
                            Customer <span className={styles.highlight}>Reviews</span>
                        </h2>
                    </div>
                    
                    <div className={styles.reviewsContainer}>
                        <svg className={styles.svgCurve} width="70" height="280">
                            <path d="M 10 10 Q 70 140 10 270" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                        
                        <div className={styles.reviewsList}>
                            <AnimatePresence mode="popLayout" initial={false}>
                                {getVisibleTestimonials().map(({ item, pos }) => {
                                    const isActive = pos === 'middle';
                                    return (
                                        <motion.div 
                                            key={item.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                            animate={{ 
                                                opacity: isActive ? 1 : 0.4, 
                                                scale: isActive ? 1 : 0.8,
                                                x: pos === 'middle' ? 35 : 0 
                                            }}
                                            exit={{ opacity: 0, scale: 0.5, x: -20 }}
                                            transition={{ 
                                                layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                                                opacity: { duration: 0.4 }
                                            }}
                                            className={`${styles.reviewItem} ${isActive ? styles.active : ''} ${styles[pos]}`}
                                            onClick={() => setActiveIndex(TESTIMONIALS.indexOf(item))}
                                        >
                                            <div className={styles.avatarWrapper}>
                                                <img src={item.image} alt={item.name} className={styles.avatar} />
                                            </div>
                                            <div className={styles.reviewMeta}>
                                                <h3 className={styles.reviewerName}>{item.name}</h3>
                                                <div className={styles.ratingRow}>
                                                    <span className={styles.star}>★</span>
                                                    <span className={styles.ratingText}>{item.rating}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.quoteWrapper}>
                        <span className={styles.quoteIcon}>“</span>
                        <div className={styles.quoteContainer}>
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className={styles.quoteText}
                                >
                                    <span className={styles.firstLetter}>{TESTIMONIALS[activeIndex].text.charAt(0)}</span>
                                    {TESTIMONIALS[activeIndex].text.slice(1)}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
