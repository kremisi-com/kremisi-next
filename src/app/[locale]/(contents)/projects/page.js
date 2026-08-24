import styles from "./page.module.css";
import ColoredTable from "@/components/colored-table/colored-table";

import { getProjectsArray } from "@/lib/projects";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const title = isItalian ? "Progetti" : "Projects";
  const description = isItalian
    ? "Scopri i progetti Kremisi: siti web, applicazioni e piattaforme digitali progettati per essere chiari, veloci e performanti."
    : "Explore Kremisi projects: websites, applications, and digital platforms designed for clarity, speed, and performance.";
  const canonical = `/${locale}/projects`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: "/en/projects",
        it: "/it/projects",
        "x-default": "/en/projects",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
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

export default async function ProjectsPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  const items = [];
  const images = [];
  const imageAlts = [];
  const links = [];

  const projectsDataArray = getProjectsArray(locale);

  projectsDataArray.forEach((project) => {
    let tmpImage = `/projects/${project.id}/${project.image}`;

    let tmpCustomer = project.customer;
    if (tmpCustomer === undefined || tmpCustomer === "")
      tmpCustomer = "Kremisi";
    else
      tmpCustomer =
        "Kremisi for " +
        project.customer
          .split("")
          .map((ch, i, arr) =>
            i === 0 || arr[i - 1] === " " || arr[i - 1] === "-"
              ? ch.toUpperCase()
              : ch,
          )
          .join("");
    items.push([project.title, project.subtitle, tmpCustomer, project.year]);
    images.push(tmpImage);
    imageAlts.push(project.previewImageAlt);
    links.push(project.path);
  });

  return (
    <main className="page-content-simple">
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>{t("kicker")}</p>
          <h1 className={styles.pageTitle}>
            {t("titleStart")} <span className={styles.accent}>{t("titleHighlight")}</span>
          </h1>
          <p className={styles.subtitle}>
            {t("subtitle")}
          </p>
        </div>
      </section>
      <ColoredTable
        items={items}
        images={images}
        imageAlts={imageAlts}
        links={links}
        className={styles.projectsTable}
      />
    </main>
  );
}
