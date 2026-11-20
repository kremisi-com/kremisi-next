import Image from "next/image";
import styles from "./brand-identity.module.css";

function localize(value, locale) {
    return value[locale] || value.en;
}

export default function BrandIdentity({
    locale = "en",
    graphicPath,
    copy,
    documents,
    goals,
    showcase,
    heroPhoto,
}) {
    const text = copy[locale] || copy.en;

    return (
        <main className={`page-content-simple ${styles.page}`}>
            <section className={`${styles.section} ${styles.hero} ${heroPhoto ? styles.photoHero : styles.illustratedHero}`}>
                <div className={styles.heroIntro}>
                    {heroPhoto && (
                        <div className={styles.heroPhoto}>
                            <Image
                                src={heroPhoto}
                                alt=""
                                fill
                                loading="eager"
                                sizes="100vw"
                            />
                        </div>
                    )}
                    <div className={styles.heroCopy}>
                        <p className={styles.kicker}>{text.kicker}</p>
                        <h1 className={styles.pageTitle}>{text.title}</h1>
                        <p className={styles.heroSubtitle}>{text.subtitle}</p>
                        <p className={styles.heroText}>{text.heroText}</p>
                    </div>
                </div>
                <div className={styles.heroVisual} aria-label={text.identityTitle}>
                    {documents.map((document, index) => (
                        <a
                            className={styles.previewCard}
                            href={`${graphicPath}/${document.fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={document.fileName}
                            aria-label={`${text.open}: ${localize(document.title, locale)}`}
                        >
                            <Image
                                src={`${graphicPath}/${document.previewImage}`}
                                width={document.previewWidth}
                                height={document.previewHeight}
                                alt={localize(document.title, locale)}
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1100px) 58vw, 34vw"
                            />
                        </a>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.contextSection}`}>
                <p className={styles.sectionEyebrow}>{text.context}</p>
                <div className={styles.textGrid}>
                    <h2 className={styles.sectionTitle}>{text.contextTitle}</h2>
                    <p className={styles.leadText}>{text.contextText}</p>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.goalLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.goalTitle}</h2>
                </div>
                <ol className={styles.goalList}>
                    {goals.map((goal, index) => (
                        <li className={styles.goalItem} key={localize(goal.title, locale)}>
                            <span className={styles.goalNumber}>{String(index + 1).padStart(2, "0")}</span>
                            <div>
                                <h3>{localize(goal.title, locale)}</h3>
                                <p>{localize(goal.description, locale)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionEyebrow}>{text.identityLabel}</p>
                    <h2 className={styles.sectionTitle}>{text.identityTitle}</h2>
                </div>
                <div className={styles.showcaseGrid}>
                    {showcase.map((item, index) => (
                        <figure className={styles.showcaseItem} key={item.image}>
                            <div className={styles.showcaseImage}>
                                <Image
                                    src={item.image}
                                    width={item.width}
                                    height={item.height}
                                    alt={`${localize(item.title, locale)} - ${text.title}`}
                                    sizes={index === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 50vw"}
                                />
                            </div>
                            <figcaption>
                                <span>{localize(item.title, locale)}</span>
                                <p>{localize(item.text, locale)}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className={`${styles.section} ${styles.resultSection}`}>
                <p className={styles.sectionEyebrow}>{text.resultLabel}</p>
                <h2 className={styles.resultTitle}>{text.resultTitle}</h2>
                <p className={styles.resultText}>{text.resultText}</p>
            </section>
        </main>
    );
}
