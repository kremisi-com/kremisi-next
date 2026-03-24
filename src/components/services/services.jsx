import styles from './services.module.css';

export default function Services() {
    const servicesList = [
        {
            title: "Product & UX",
            description: "Product design, UX flows and interface definition based on real use cases and business goals.",
            keywords: ["Product Strategy", "UX Flows", "UI Systems"]
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
            </div>
            
            <div className={styles.listContainer}>
                {servicesList.map((service, index) => (
                    <div key={index} className={styles.listItem}>
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

