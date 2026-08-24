import Services from "@/components/services/services";
import styles from "./page.module.css";

const BASE_URL = "https://kremisi.com";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const title = isItalian ? "Servizi" : "Services";
  const description = isItalian
    ? "Scopri i servizi Kremisi: product e UX, piattaforme web, app mobile, AI e dati, crescita e SEO."
    : "Explore Kremisi services: product and UX, web platforms, mobile apps, AI and data, growth, and SEO.";
  const canonical = `/${locale}/services`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: "/en/services",
        it: "/it/services",
        "x-default": "/en/services",
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

export default async function ServicesPage({ params }) {
  const { locale } = await params;
  const isItalian = locale === "it";
  const canonicalUrl = `${BASE_URL}/${locale}/services`;
  const serviceNames = isItalian
    ? ["Prodotto e UX", "Piattaforme web", "App mobile", "AI e dati", "Crescita e SEO"]
    : ["Product and UX", "Web platforms", "Mobile apps", "AI and data", "Growth and SEO"];
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
            item: `${BASE_URL}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isItalian ? "Servizi" : "Services",
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: isItalian ? "Servizi Kremisi" : "Kremisi Services",
        url: canonicalUrl,
        inLanguage: locale,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: serviceNames.map((name, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Service",
              name,
              provider: { "@id": `${BASE_URL}/#organization` },
            },
          })),
        },
      },
    ],
  };

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Services titleAs="h1" />
    </main>
  );
}
