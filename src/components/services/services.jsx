"use client";
import { useState, useRef, useEffect } from 'react';
import { animate } from 'framer-motion';
import styles from './services.module.css';

export default function Services() {
    const [activeIndex, setActiveIndex] = useState(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        if (activeIndex !== null && itemRefs.current[activeIndex]) {
            // Slight delay to allow the layout to settle and the expansion to start
            const timeoutId = setTimeout(() => {
                const element = itemRefs.current[activeIndex];
                const rect = element.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Calculate position to center the element
                const targetY = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2);

                animate(scrollTop, targetY, {
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1], // Smooth premium easing
                    onUpdate: (latest) => window.scrollTo(0, latest)
                });
            }, 400);

            return () => clearTimeout(timeoutId);
        }
    }, [activeIndex]);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const servicesList = [
        {
            title: "Product & UX",
            description: "Product design, UX flows and interface definition based on real use cases and business goals.",
            keywords: ["Product Strategy", "UX Flows", "Brand & UI Systems"],
            expandedDetails: {
                intro: "We define how your product works before writing any code.",
                supporting: "Starting from real use cases, we structure flows and interfaces to remove complexity.",
                bullets: [
                    "Product structure and feature definition",
                    "User flows and interaction logic",
                    "Interface systems and design consistency",
                    "Visual identity aligned with the product"
                ]
            }
        },
        {
            title: "Web Platform",
            description: "We build scalable web platforms designed to support real business operations.",
            keywords: ["Architecture", "API & Backend", "Scalability"],
            expandedDetails: {
                intro: "From architecture to delivery, we turn complex requirements into reliable and high-performing systems.",
                bullets: [
                    "Platform architecture and system design",
                    "API integration and backend logic",
                    "Scalable frontend development",
                    "Performance and maintainability optimization"
                ]
            }
        },
        {
            title: "Mobile Apps",
            description: "We create mobile apps that feel fast, intuitive and native on every device.",
            keywords: ["iOS & Android", "React Native", "Mobile UX"],
            expandedDetails: {
                intro: "From MVP to full product, we focus on usability, performance and long-term engagement.",
                bullets: [
                    "iOS and Android app development",
                    "Cross-platform solutions (React Native)",
                    "UX optimization for mobile contexts",
                    "App performance and scalability"
                ]
            }
        },
        {
            title: "AI & Data",
            description: "We use AI and data to automate processes and unlock smarter decision-making.",
            keywords: ["AI & Automation", "Data Analysis", "LLM Tools"],
            expandedDetails: {
                intro: "We integrate intelligent systems into your products with a practical, results-driven approach.",
                bullets: [
                    "AI integrations and automation workflows",
                    "Data processing and analysis pipelines",
                    "Custom tools powered by LLMs",
                    "Business logic optimization through data"
                ]
            }
        },
        {
            title: "Growth & SEO",
            description: "We optimize products to increase visibility, traffic and conversions over time.",
            keywords: ["SEO Strategy", "CRO", "Performance Tracking"],
            expandedDetails: {
                intro: "Combining SEO, data analysis and continuous iteration, we turn traffic into measurable growth.",
                bullets: [
                    "Technical SEO and site structure",
                    "Content and keyword strategy",
                    "Conversion rate optimization (CRO)",
                    "Analytics and performance tracking"
                ]
            }
        }
    ];

    return (
        <section className={styles.servicesSection} id="services">
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <p className={styles.subtitle}>
                        <span className={styles.subtitleLine}></span>
                        Our Services
                    </p>
                    <h2 className={styles.title}>
                        We Build <span className={styles.highlight}>Digital Products</span><br/>
                        That Actually Work
                    </h2>
                </div>
                <div className={styles.headerRight}>
                    <p className={styles.headerDescription}>
                        From idea to scalable platforms,<br/>we build systems that run your business.
                    </p>
                </div>
            </div>
            
            <div className={styles.listContainer}>
                {servicesList.map((service, index) => (
                    <div 
                        key={index} 
                        ref={(el) => (itemRefs.current[index] = el)}
                        className={`${styles.listItem} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => toggleAccordion(index)}
                    >
                        <div className={styles.itemNumber}>
                            {(index + 1).toString().padStart(2, '0')}
                        </div>
                        
                        <div className={styles.itemContent}>
                            <div className={styles.titleRow}>
                                <h3 className={styles.serviceName}>{service.title}</h3>
                                <div className={styles.titleArrow}>
                                    <svg viewBox="0 0 60 60" fill="none" className={styles.svgIcon}>
                                        <path className={styles.arrowPath} d="M15 30h30M35 20l10 10-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <p className={styles.serviceDescription}>{service.description}</p>

                            <div className={`${styles.expandedContent} ${activeIndex === index ? styles.expanded : ''}`}>
                                <div className={styles.expandedInner}>
                                    <div className={styles.expandedSection}>
                                        {service.expandedDetails.intro && (
                                            <div className={styles.detailBlock}>
                                                <p className={styles.detailIntro}>
                                                    {service.expandedDetails.intro}
                                                </p>
                                                {service.expandedDetails.supporting && (
                                                    <p className={styles.detailSupporting}>
                                                        {service.expandedDetails.supporting}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        
                                        {service.expandedDetails.bullets && (
                                            <div className={styles.detailBlock}>
                                                <ul className={styles.detailList}>
                                                    {service.expandedDetails.bullets.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.keywordList}>
                                {service.keywords.map((kw, i) => (
                                    <span key={i} className={styles.keywordTag}>{kw}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

