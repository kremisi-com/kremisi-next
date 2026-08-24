import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./about.module.css";
import ColoredTable from "@/components/colored-table/colored-table";
import GitButton from "@/components/git-button/git-button";
import ColoredList from "@/components/colored-list/colored-list";
import AnimatedLink from "@/components/animated-link/animated-link";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const title = isItalian ? "Chi siamo" : "About";
  const description = isItalian
    ? "Scopri Kremisi, il nostro team e il nostro approccio al design, allo sviluppo web e alla creazione di prodotti digitali."
    : "Learn more about Kremisi, our team, and our approach to web design, web development, and digital product delivery.";
  const url = `/${locale}/about`;

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

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const skills = [
    { name: "Next.js", level: "rainbow" },
    { name: "TypeScript", level: "rainbow" },
    { name: "React.js", level: "rainbow" },
    { name: "Drizzle ORM", level: "rainbow" },
    { name: "Zod", level: "rainbow" },
    { name: "Zustand", level: "rainbow" },
    {
      name: isItalian ? "Sviluppo web" : "Web Development",
      level: "rainbow",
    },
    {
      name: isItalian ? "Ottimizzazione SEO" : "SEO Optimization",
      level: "rainbow",
    },

    { name: isItalian ? "Analisi dati" : "Data Analysis", level: "silver" },
    { name: "Business Intelligence", level: "silver" },
    { name: "Forecasting", level: "silver" },
    {
      name: isItalian ? "Sistemi di raccomandazione" : "Recommender Systems",
      level: "silver",
    },
    {
      name: isItalian ? "Analisi predittiva" : "Predictive Analytics",
      level: "silver",
    },
    {
      name: isItalian ? "Analisi delle serie temporali" : "Time Series Analysis",
      level: "silver",
    },
    { name: "Machine Learning", level: "silver" },
    {
      name: isItalian ? "Modellazione statistica" : "Statistical Modeling",
      level: "silver",
    },

    { name: "Python", level: "silver" },
    { name: "SQL", level: "silver" },
    { name: "Data Visualization", level: "silver" },
    { name: isItalian ? "Dashboard KPI" : "KPI Dashboards", level: "silver" },
    { name: isItalian ? "Pipeline ETL" : "ETL Pipelines", level: "silver" },
    { name: "A/B Testing", level: "silver" },
    { name: "Product Analytics", level: "silver" },
    {
      name: isItalian ? "Strategia data-driven" : "Data-Driven Strategy",
      level: "silver",
    },

    { name: "Node.js", level: "bronze" },
    { name: "RESTful APIs", level: "bronze" },
    { name: "PostgreSQL", level: "bronze" },
    { name: "UI/UX Design", level: "bronze" },
    { name: "Responsive Design", level: "bronze" },
    { name: "Web Performance", level: "bronze" },
    { name: isItalian ? "SEO tecnica" : "Technical SEO", level: "bronze" },
  ];

  const team = isItalian
    ? [
        [
          "Andrea Napolitano",
          "Founder",
          "Strategia digitale · Business Development",
        ],
        [
          "Alessandro Pignanelli",
          "Co-Founder",
          "Operations · Coordinamento progetti",
        ],
        [
          "Giovanni Caiazzo",
          "Chief Technology Officer",
          "Architettura software · Engineering Leadership",
        ],
        [
          "Alessia Napolitano",
          "Chief Product Officer",
          "Strategia di prodotto · UX · Roadmap",
        ],
        [
          "Antonio Caiazzo",
          "Director of Infrastructure",
          "Cloud Infrastructure · DevOps · Sicurezza",
        ],
        [
          "Cristian Stortoni",
          "Chief Sales Officer",
          "Strategia commerciale · Partnership · Crescita",
        ],
        [
          "Muhammad Umer",
          "Chief Data Officer",
          "Strategia dati · Analytics · AI/ML",
        ],
      ]
    : [
        [
          "Andrea Napolitano",
          "Founder",
          "Digital Strategy - Business Development",
        ],
        [
          "Alessandro Pignanelli",
          "Co-Founder",
          "Operations - Project Coordination",
        ],
        [
          "Giovanni Caiazzo",
          "Chief Technology Officer",
          "Software Architecture - Engineering Leadership",
        ],
        [
          "Alessia Napolitano",
          "Chief Product Officer",
          "Product Strategy, UX - Roadmap",
        ],
        [
          "Antonio Caiazzo",
          "Director Of Infrastructure",
          "Cloud Infrastructure, DevOps - Security",
        ],
        [
          "Cristian Stortoni",
          "Chief Sales Officer",
          "Sales Strategy, Partnerships - Growth",
        ],
        [
          "Muhammad Umer",
          "Chief Data Officer",
          "Data Strategy, Analytics - AI/ML",
        ],
      ];

  return (
    <main className="page-content-simple">
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            {isItalian ? "Chi siamo" : "About Kremisi"}
          </p>
          <h1 className={styles.pageTitle}>
            {isItalian ? (
              <>
                Creiamo prodotti digitali{" "}
                <em className={styles.accent}>senza limiti</em>
              </>
            ) : (
              <>
                We Build <span className={styles.accent}>Limitless</span> Digital
                Products
              </>
            )}
          </h1>
          <p className={styles.subtitle}>
            {isItalian ? (
              <>
                <span className={styles.subtitleHighlight}>Kremisi</span> è una
                software company nata in Italia, con{" "}
                <span className={`${styles.subtitleHighlight} ${styles.nowrap}`}>
                  oltre 8 anni di esperienza
                </span>{" "}
                nello sviluppo di prodotti web e applicazioni.
              </>
            ) : (
              <>
                <span className={styles.subtitleHighlight}>Kremisi</span> is a
                distributed software company, founded in Italy, with{" "}
                <span className={`${styles.subtitleHighlight} ${styles.nowrap}`}>
                  8+ years
                </span>{" "}
                of experience in web and app development.
              </>
            )}
          </p>
        </div>
      </section>
      <section className={styles.section}>
        <RevelatingText>
          {isItalian ? (
            <>
              Dall&apos;idea al lancio, uniamo{" "}
              <span className={"highlight"}>strategia</span>,{" "}
              <span className={"highlight"}>design</span> e{" "}
              <span className={"highlight"}>sviluppo</span> per dare forma ai
              progetti di brand ambiziosi.
              <br />
              <br />
              Creiamo esperienze digitali{" "}
              <span className={"highlight"}>coinvolgenti e funzionali</span>,
              curando <span className={"highlight"}>frontend</span> e{" "}
              <span className={"highlight"}>backend</span> con particolare
              attenzione a estetica, usabilità e performance.
              <br />
              <br />
              Kremisi nasce con l&apos;obiettivo di{" "}
              <span className={"highlight"}>
                superare i limiti delle soluzioni standard
              </span>
              , lasciando spazio alle idee e alla complessità di ogni progetto.
            </>
          ) : (
            <>
              From concept to launch, we combine{" "}
              <span className={"highlight"}>strategy</span>,{" "}
              <span className={"highlight"}>design</span>, and{" "}
              <span className={"highlight"}>development</span> for ambitious
              brands.
              <br />
              <br />
              We create engaging and functional digital experiences, working on
              both <span className={"highlight"}>frontend</span> and{" "}
              <span className={"highlight"}>backend</span>, with a strong focus
              on aesthetics and usability.
              <br />
              <br /> Kremisi was created with the goal of developing{" "}
              <span className={"highlight"}>limitless</span> solutions, giving
              space to ideas and complex projects in every direction.
            </>
          )}
        </RevelatingText>
      </section>
      <section className={styles.section}>
        <h2>Tech Stack</h2>
        <ColoredList items={skills} />
      </section>
      <section className={styles.section}>
        <h2>{isItalian ? "Il team" : "Meet The Team"}</h2>
        <ColoredTable items={team} />
      </section>
      <section className={`${styles.section} flex-center`}>
        <AnimatedLink href={"/contacts"}>
          <GitButton
            text={isItalian ? "Parliamone" : "Get in touch"}
            leftShift={-20}
          />
        </AnimatedLink>
      </section>
    </main>
  );
}
