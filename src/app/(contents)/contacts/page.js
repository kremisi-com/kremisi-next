import AnimatedLink from "@/components/animated-link/animated-link";
import ContactForm from "@/components/contact-form/contact-form";
import GitButton from "@/components/git-button/git-button";
import { Mail, Phone, MapPin } from "lucide-react";
import styles from "./page.module.css";

const BASE_URL = "https://kremisi.com";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;
const CONTACT_URL = `${BASE_URL}/contacts`;
const CONTACT_DESCRIPTION =
  "Contact Kremisi to discuss development, design & development, and data & analytics projects. We work internationally and reply within 24 business hours.";

export const metadata = {
  title: "Contact for Web Development, Design & Data Analytics",
  description: CONTACT_DESCRIPTION,
  alternates: {
    canonical: "/contacts",
  },
  openGraph: {
    title: "Contact for Web Development, Design & Data Analytics",
    description: CONTACT_DESCRIPTION,
    url: "/contacts",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact for Web Development, Design & Data Analytics",
    description: CONTACT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function ContactsPage() {
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
            name: "Contacts",
            item: CONTACT_URL,
          },
        ],
      },
      {
        "@type": "ContactPage",
        "@id": `${CONTACT_URL}#contact-page`,
        url: CONTACT_URL,
        name: "Contact Kremisi",
        description: CONTACT_DESCRIPTION,
        inLanguage: "en",
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
            <p className={styles.kicker}>Start a Project</p>
            <h1 className={styles.pageTitle}>
              Let&apos;s Build Something That{" "}
              <span className={styles.accent}>Performs</span>
            </h1>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.contentSplit}>
            <div className={styles.infoLead}>
              <p className={styles.leadText}>
                Tell us what you're building, where you need support, and what
                timeline you're working with. We'll reply within 24 business
                hours with a clear next step.
              </p>
              <AnimatedLink
                href="https://wa.me/393517444749?text=Hi%20Kremisi%2C%20I%27d%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                <GitButton text="Chat on WhatsApp" />
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
                  <span>Phone</span>
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
                  <span>Location</span>
                </dt>
                <dd className={styles.metaValue}>
                  Distributed team, working internationally
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tell Us About Your Project</h2>
            <p className={styles.sectionIntro}>
              Share the scope, budget, and preferred timeline.
              <br />
              We&apos;ll use it to reply with a clear next step.
            </p>
          </div>
          <div className={styles.formWrap}>
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
