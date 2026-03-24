import styles from './services.module.css';

export default function Services() {
    const servicesList = [
        "Branding",
        "Development",
        "UI/UX Design",
        "Graphic Design",
        "SEO"
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
                        What <span className={styles.highlight}>Services</span><br/>
                        We{"'"}re Offering
                    </h2>
                </div>
                <div className={styles.headerRight}>
                    <p className={styles.description}>
                        We offer services that can help businesses improve their visibility and business reputation online, expand market reach, and increase turnover through effective digital strategies. Following are the services we provide.
                    </p>
                </div>
            </div>
            
            <div className={styles.listContainer}>
                {servicesList.map((service, index) => (
                    <div key={index} className={styles.listItem}>
                        <div className={styles.itemLeft}>
                            <span className={styles.itemNumber}>
                                {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <h3 className={styles.serviceName}>
                                {service}
                                <span className={styles.serviceDot}>.</span>
                            </h3>
                        </div>
                        <div className={styles.arrowIcon}>
                            <svg viewBox="0 0 60 60" fill="none" className={styles.svgIcon}>
                                <circle className={styles.arrowCircle} cx="30" cy="30" r="29" stroke="currentColor" strokeWidth="1"/>
                                <path className={styles.arrowPath} d="M20 30h20M30 20l10 10-10 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
