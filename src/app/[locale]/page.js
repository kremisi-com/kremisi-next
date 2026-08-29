import { getTranslations } from "next-intl/server";
import HomeClient from "./home-client";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  const pathname = `/${locale}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: pathname,
      languages: { en: "/en", it: "/it", "x-default": "/en" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: pathname,
      locale: locale === "it" ? "it_IT" : "en_US",
    },
    twitter: { title: t("title"), description: t("description") },
  };
}

export default async function HomePage({ searchParams }) {
  const { view } = await searchParams;

  return <HomeClient initialOverviewVisible={view === "overview"} />;
}
