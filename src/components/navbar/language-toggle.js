"use client";

import Image from "next/image";
import Button from "@/components/button/button";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function LanguageToggle({ styles }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("navigation");
  const nextLocale = locale === "it" ? "en" : "it";
  const query = searchParams.toString();
  const localizedPath = query ? `${pathname}?${query}` : pathname;

  return (
    <Button
      className={`${styles.icon} ${styles.languageToggle}`}
      animation={false}
      title={t("switchTo")}
      aria-label={t("switchTo")}
      onClick={() => router.replace(localizedPath, { locale: nextLocale })}
    >
      <Image
        src={
          nextLocale === "it"
            ? "/images/icons/languages/italy.png"
            : "/images/icons/languages/united-kingdom.png"
        }
        alt={nextLocale === "it" ? "Italiano" : "English"}
        width={20}
        height={20}
        className={[
          styles.languageFlag,
          nextLocale === "it" ? styles.languageFlagItalian : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </Button>
  );
}
