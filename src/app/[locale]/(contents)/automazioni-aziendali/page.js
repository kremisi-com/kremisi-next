import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Overview from "@/components/overview/overview";
import GitButton from "@/components/git-button/git-button";
import ContactForm from "@/components/contact-form/contact-form";
import SocialProof from "@/components/social-proof/social-proof";
import Testimonials from "@/components/testimonials/testimonials";
import VideosCta from "@/components/videos-cta/videos-cta";
import projects from "@/lib/projects.json";
import CampaignLink from "./campaign-link";
import styles from "./page.module.css";

const SLUG = "automazioni-aziendali";
const caseStudy = projects.bpmn2petrinet;

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "automation" });

    const title = t("meta.title");
    const description = t("meta.description");
    const url = `/${locale}/${SLUG}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
            languages: {
                it: `/it/${SLUG}`,
                en: `/en/${SLUG}`,
                "x-default": `/en/${SLUG}`,
            },
        },
        openGraph: {
            title: `${title} | Kremisi`,
            description,
            url,
            type: "website",
            locale: locale === "it" ? "it_IT" : "en_US",
            images: [{ url: "/og-image.jpg", alt: "Kremisi" }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | Kremisi`,
            description,
            images: ["/og-image.jpg"],
        },
    };
}

export default async function AutomationPage({ params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "automation" });
    const closing = await getTranslations({ locale, namespace: "cta" });

    return (
        <main className={styles.page}>
            <a href="#contatto" className={styles.skipLink}>{t("skipToContact")}</a>
            <Overview variant="campaign" id="inizio" aria-labelledby="automation-title">
                <p className={styles.eyebrow}>{t("hero.eyebrow")}</p>
                <h1 id="automation-title" className={styles.heroTitle}>
                    {t("hero.line1")}<br />
                    <span>{t("hero.line2")}</span>
                </h1>
                <p className={styles.heroDescription}>{t("hero.description")}</p>
                <div className={styles.heroActions}>
                    <CampaignLink href="#contatto" placement="hero_contact" className={styles.primaryLink}>
                        <GitButton text={t("cta")} isLinkContent className={styles.heroButton} />
                    </CampaignLink>
                    <CampaignLink href="#progetto" placement="hero_case" className={styles.textLink}>
                        {t("hero.caseLink")} <span aria-hidden="true">↘</span>
                    </CampaignLink>
                </div>
                <p className={styles.heroNote}>{t("hero.note")}</p>
            </Overview>

            <section className={styles.section} aria-labelledby="solutions-title" id="soluzioni">
                <div className={styles.sectionHeader}>
                    <p className={styles.eyebrow}>{t("solutions.eyebrow")}</p>
                    <h2 id="solutions-title" className={styles.sectionTitle}>{t("solutions.title")}</h2>
                    <p className={styles.intro}>{t("solutions.intro")}</p>
                </div>
                <ol className={styles.solutionList}>
                    {["connections", "custom", "ai"].map((key, index) => (
                        <li key={key} className={styles.solutionRow}>
                            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                            <div className={styles.problem}>
                                <p className={styles.label}>{t("solutions.problemLabel")}</p>
                                <h3>{t(`solutions.${key}.problem`)}</h3>
                            </div>
                            <div className={styles.solution}>
                                <p className={styles.label}>{t(`solutions.${key}.name`)}</p>
                                <p>{t(`solutions.${key}.description`)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className={`${styles.section} ${styles.caseSection}`} id="progetto" aria-labelledby="case-title">
                <div className={styles.caseHeader}>
                    <p className={styles.eyebrow}>{t("case.eyebrow")}</p>
                    <p className={styles.projectMeta}>{caseStudy.title} <span aria-hidden="true">/</span> {caseStudy.year}</p>
                </div>
                <div className={styles.caseGrid}>
                    <div className={styles.caseCopy}>
                        <h2 id="case-title" className={styles.sectionTitle}>{t("case.title")}</h2>
                        <p className={styles.intro}>{t("case.description")}</p>
                        <p className={styles.caseContext}>{t("case.context")}</p>
                        <Link href={`/${locale}/projects/bpmn2petrinet`} className={styles.textLink}>
                            {t("case.link")} <span aria-hidden="true">↗</span>
                        </Link>
                    </div>
                    <figure className={styles.caseFigure}>
                        <div className={styles.imageFrame}>
                            <Image
                                src={`/projects/bpmn2petrinet/${caseStudy.headerImage}`}
                                alt={t("case.imageAlt")}
                                width={1440}
                                height={960}
                                sizes="(max-width: 900px) 90vw, 52vw"
                                className={styles.caseImage}
                            />
                        </div>
                        <figcaption>{t("case.caption")}</figcaption>
                    </figure>
                </div>
            </section>

            <section className={styles.section} aria-labelledby="method-title">
                <div className={styles.sectionHeader}>
                    <p className={styles.eyebrow}>{t("method.eyebrow")}</p>
                    <h2 id="method-title" className={styles.sectionTitle}>{t("method.title")}</h2>
                </div>
                <ol className={styles.methodList}>
                    {["understand", "define", "build"].map((key, index) => (
                        <li key={key}>
                            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                            <h3>{t(`method.${key}.title`)}</h3>
                            <p>{t(`method.${key}.description`)}</p>
                        </li>
                    ))}
                </ol>
                <CampaignLink href="#contatto" placement="method_contact" className={styles.textLink}>
                    {t("cta")} <span aria-hidden="true">↗</span>
                </CampaignLink>
            </section>

            <SocialProof isActive variant="campaign" cta={
                <CampaignLink href="#contatto" placement="social_proof_contact" className={styles.primaryLink}>
                    <GitButton text={t("cta")} isLinkContent className={styles.heroButton} />
                </CampaignLink>
            } />
            <Testimonials featuredProjectId="casa-palmi" />

            <section className={`${styles.section} ${styles.contactSection}`} id="contatto" aria-labelledby="contact-title">
                <div className={styles.sectionHeader}>
                    <p className={styles.eyebrow}>{t("contact.eyebrow")}</p>
                    <h2 id="contact-title" className={styles.contactTitle}>{t("contact.title")}</h2>
                    <div className={styles.contactIntro}>
                        <p className={styles.intro}>{t("contact.description")}</p>
                        <p className={styles.emailFallback}>
                            {t("contact.emailLabel")}<br />
                            <a href="mailto:info@kremisi.com" className={styles.textLink}>info@kremisi.com <span aria-hidden="true">↗</span></a>
                        </p>
                    </div>
                </div>
                <div className={styles.formWrap}>
                    <ContactForm locale={locale} variant="automation" />
                </div>
            </section>
            <VideosCta variant="campaign" cta={
                <CampaignLink href="#contatto" placement="closing_contact" className={styles.primaryLink}>
                    <GitButton text={closing("connect")} isLinkContent className={styles.heroButton} />
                </CampaignLink>
            } />
        </main>
    );
}
