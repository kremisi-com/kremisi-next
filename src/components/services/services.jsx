"use client";
import { useState } from 'react';
import styles from './services.module.css';

export default function Services() {
    const [activeIndex, setActiveIndex] = useState(null);

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
                supporting: "Starting from real use cases, we structure features, user flows and interfaces to remove complexity.",
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
            description: "Development of high-performance web platforms (Next.js, APIs, databases) built to handle real operations.",
            keywords: ["Next.js", "APIs", "Database", "Performance"]
        },
        {
            title: "Mobile Apps",
            description: "Mobile applications connected to your platform, designed for daily usage and real users.",
            keywords: ["React Native", "iOS", "Android"]
        },
        {
            title: "AI & Data",
            description: "Integration of AI features and data analysis to automate workflows, track behavior and support decisions.",
            keywords: ["Automation", "Tracking", "Analytics"]
        },
        {
            title: "Growth & SEO",
            description: "SEO structure, performance optimization and tracking systems to acquire and convert users.",
            keywords: ["SEO", "Performance", "Conversion"]
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
                                    {service.expandedDetails ? (
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
                                    ) : (
                                        <div className={styles.expandedTextContent}>
                                            <p className={styles.loremIntro}>
                                                A deep dive into how we solve complex problems with modern technology and user-centric design principles.
                                            </p>
                                            <p className={styles.loremText}>
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna. Ut enim ad minim veniam, quis nostrud exercitation ut labore et dolore.
                                            </p>
                                        </div>
                                    )}
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

