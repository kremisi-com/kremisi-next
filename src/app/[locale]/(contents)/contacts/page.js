import AnimatedLink from "@/components/animated-link/animated-link";
import ContactForm from "@/components/contact-form/contact-form";
import GitButton from "@/components/git-button/git-button";
import { Mail, Phone, MapPin } from "lucide-react";
import styles from "./page.module.css";

const BASE_URL = "https://kremisi.com";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const EN_DESCRIPTION =
  "Contact Kremisi to discuss development, design & development, and data & analytics projects. We work internationally and reply within 24 business hours.";
const IT_DESCRIPTION =
  "Contatta Kremisi per parlare del tuo progetto di sviluppo, design, AI o Data. Lavoriamo in Italia e all'estero e rispondiamo entro 24 ore lavorative.";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const title = isItalian
    ? "Contatti per sviluppo web, design, AI e Data"
    : "Contact for Web Development, Design & Data Analytics";
  const description = isItalian ? IT_DESCRIPTION : EN_DESCRIPTION;
  const url = `/${locale}/contacts`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: isItalian ? "it_IT" : "en_US",
      images: ["/og-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function ContactsPage({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const contactUrl = `${BASE_URL}/${locale}/contacts`;
  const contactDescription = isItalian ? IT_DESCRIPTION : EN_DESCRIPTION;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isItalian ? "Contatti" : "Contacts",
            item: contactUrl,
          },
        ],
      },
      {
        "@type": "ContactPage",
        "@id": `${contactUrl}#contact-page`,
        url: contactUrl,
        name: isItalian ? "Contatta Kremisi" : "Contact Kremisi",
        description: contactDescription,
        inLanguage: locale,
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": ORGANIZATION_ID,
        },
        mainEntity: {
          "@id": ORGANIZATION_ID,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className={`page-content-simple ${styles.page}`}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>
              {isItalian ? "Inizia un progetto" : "Start a Project"}
            </p>
            <h1 className={styles.pageTitle}>
              {isItalian ? (
                <>
                  Costruiamo insieme qualcosa di{" "}
                  <span className={styles.accent}>concreto</span>
                </>
              ) : (
                <>
                  Let&apos;s Build Something That{" "}
                  <span className={styles.accent}>Performs</span>
                </>
              )}
            </h1>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.contentSplit}>
            <div className={styles.infoLead}>
              <p className={styles.leadText}>
                {isItalian
                  ? "Raccontaci cosa vuoi realizzare, dove hai bisogno di supporto e quali sono le tue tempistiche. Ti risponderemo entro 24 ore lavorative con i prossimi passi."
                  : "Tell us what you're building, where you need support, and what timeline you're working with. We'll reply within 24 business hours with a clear next step."}
              </p>
              <AnimatedLink
                href={
                  isItalian
                    ? "https://wa.me/393517444749?text=Ciao%20Kremisi%2C%20vorrei%20parlarvi%20di%20un%20progetto."
                    : "https://wa.me/393517444749?text=Hi%20Kremisi%2C%20I%27d%20like%20to%20discuss%20a%20project."
                }
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                <GitButton
                  text={isItalian ? "Chatta su WhatsApp" : "Chat on WhatsApp"}
                />
              </AnimatedLink>
            </div>

            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>
                  <Mail className={styles.metaIcon} size={20} strokeWidth={2} />
                  <span>Email</span>
                </dt>
                <dd className={styles.metaValue}>
                  <a href="mailto:info@kremisi.com">info@kremisi.com</a>
                </dd>
              </div>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>
                  <Phone
                    className={styles.metaIcon}
                    size={20}
                    strokeWidth={2}
                  />
                  <span>{isItalian ? "Telefono" : "Phone"}</span>
                </dt>
                <dd className={styles.metaValue}>
                  <a href="tel:+393517444749">+39 351 744 4749</a>
                </dd>
              </div>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>
                  <MapPin
                    className={styles.metaIcon}
                    size={20}
                    strokeWidth={2}
                  />
                  <span>{isItalian ? "Dove siamo" : "Location"}</span>
                </dt>
                <dd className={styles.metaValue}>
                  {isItalian
                    ? "Team distribuito, lavoriamo con clienti in Italia e all'estero"
                    : "Distributed team, working internationally"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isItalian ? "Parlaci del tuo progetto" : "Tell Us About Your Project"}
            </h2>
            <p className={styles.sectionIntro}>
              {isItalian ? (
                <>
                  Condividi obiettivi, budget e tempistiche.
                  <br />
                  Ci aiuteranno a capire il progetto e proporti i prossimi passi.
                </>
              ) : (
                <>
                  Share the scope, budget, and preferred timeline.
                  <br />
                  We&apos;ll use it to reply with a clear next step.
                </>
              )}
            </p>
          </div>
          <div className={styles.formWrap}>
            <ContactForm locale={locale} />
          </div>
        </section>
      </main>
    </>
  );
}
