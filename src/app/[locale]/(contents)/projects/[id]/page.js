import { getProjectCarouselImageAlt, getProjectData, getProjectsArray } from "@/lib/projects";
import Image from "next/image";
import { notFound } from "next/navigation";
import style from "./page.module.css";
import GitButton from "@/components/git-button/git-button";
import AnimatedLink from "@/components/animated-link/animated-link";
import LucreziaCurtoBrandIdentity from "@/components/case-studies/lucrezia-curto-brand-identity";

const BASE_URL = "https://kremisi.com";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

function stripHtml(text = "") {
    return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getProjectMetaDescription(projectData) {
    const fallback =
        "Explore this web design and web development project by Kremisi.";
    const cleaned = stripHtml(projectData?.description || "");
    if (!cleaned) return fallback;
    if (cleaned.length <= 160) return cleaned;
    return `${cleaned.slice(0, 157).trimEnd()}...`;
}

export async function generateStaticParams() {
    return getProjectsArray()
        .filter((project) => !project.directPath)
        .map((project) => ({
            id: project.slug,
        }));
}

function getProjectStructuredData(projectData, locale) {
    const canonicalPath = `/${locale}${projectData.path}`;
    const canonicalUrl = new URL(canonicalPath, BASE_URL).toString();
    const imageUrl = projectData.headerImage
        ? new URL(
              `/projects/${projectData.assetFolder}/${projectData.headerImage}`,
              BASE_URL
          ).toString()
        : `${BASE_URL}/og-image.jpg`;
    const keywords = [...(projectData.tags || []), ...(projectData.tasks || [])];

    return {
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
                        name: locale === "it" ? "Progetti" : "Projects",
                        item: `${BASE_URL}/${locale}/projects`,
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: projectData.title,
                        item: canonicalUrl,
                    },
                ],
            },
            {
                "@type": "CreativeWork",
                "@id": `${canonicalUrl}#creative-work`,
                headline: projectData.title,
                name: projectData.title,
                description: getProjectMetaDescription(projectData),
                url: canonicalUrl,
                mainEntityOfPage: canonicalUrl,
                image: imageUrl,
                inLanguage: locale,
                author: {
                    "@id": ORGANIZATION_ID,
                },
                publisher: {
                    "@id": ORGANIZATION_ID,
                },
                isPartOf: `${BASE_URL}/${locale}/projects`,
                datePublished: projectData.year
                    ? `${projectData.year}-01-01`
                    : undefined,
                dateCreated: projectData.year
                    ? `${projectData.year}-01-01`
                    : undefined,
                keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
                sameAs: projectData.link || undefined,
            },
        ],
    };
}

export async function generateMetadata({ params }) {
    const { id, locale } = await params;
    const projectData = getProjectData(id, locale);

    if (!projectData) {
        return {
            title: "Project",
            description:
                "Explore our web design and web development projects.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const projectTitle = projectData.title || "Project";
    const subtitle = projectData.subtitle ? ` - ${projectData.subtitle}` : "";
    const year = projectData.year ? ` (${projectData.year})` : "";
    const title = `${projectTitle}${subtitle}${year}`;
    const description = getProjectMetaDescription(projectData);
    const canonical = `/${locale}${projectData.path}`;
    const image = projectData.headerImage
        ? `/projects/${projectData.assetFolder}/${projectData.headerImage}`
        : "/og-image.jpg";

    return {
        title,
        description,
        keywords: [...(projectData.tags || []), ...(projectData.tasks || [])],
        alternates: {
            canonical,
            languages: {
                en: `/en${projectData.path}`,
                it: `/it${projectData.path}`,
                "x-default": `/en${projectData.path}`,
            },
        },
        openGraph: {
            title,
            description,
            url: canonical,
            type: "article",
            images: [
                {
                    url: image,
                    alt: projectData.headerImageAlt,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}

export default async function ProjectPage({ params }) {
    const { id, locale } = await params;

    const projectData = getProjectData(id, locale);

    if (!projectData) notFound();

    const projectStructuredData = getProjectStructuredData(projectData, locale);
    const isItalian = locale === "it";
    const isLucreziaBrandIdentity =
        projectData.caseStudy === "lucrezia-curto-brand-identity";

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(projectStructuredData),
                }}
            />
            {!isLucreziaBrandIdentity && (
                <>
                    <div className={style.header}>
                        <Image
                            src={`/projects/${projectData.assetFolder}/${projectData.headerImage}`}
                            alt={projectData.headerImageAlt}
                            fill
                            priority
                        />
                        <h1
                            dangerouslySetInnerHTML={{ __html: projectData.slogan }}
                        />
                        <p className={style.disclaimer}>
                            {isItalian
                                ? "Tutti i diritti sulle immagini appartengono ai rispettivi proprietari"
                                : "All rights to the images are retained by the respective owner"}
                        </p>
                    </div>
                    <div className={`${style.overview}`}>
                <div className="row">
                    <div className="col mb-0 no-wrap">
                        <div className={style.client}>
                            <div className={style.clientName}>
                                {isItalian ? "Cliente" : "Client"}: {projectData.title}
                            </div>
                        </div>
                    </div>
                    <div className="col mb-0 no-wrap">
                        <div className={style.client}>
                            <div className={style.clientYear}>
                                {isItalian ? "Anno" : "Year"}: {projectData.year}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-1-3">
                        <h3 style={{ textTransform: "uppercase" }}>
                            {isItalian ? "Panoramica del progetto" : "Project Overview"}
                        </h3>
                        <AnimatedLink
                            className={`${style.link} onlyDesktop`}
                            href={projectData.link}
                            target="_blank"
                        >
                            <GitButton text={isItalian ? "Visita il sito" : "Live Demo"} />
                        </AnimatedLink>
                    </div>
                    <div className="col-2-3">
                        <p
                            dangerouslySetInnerHTML={{
                                __html: projectData.description,
                            }}
                        ></p>
                        <div className={style.overviewFooter}>
                            <div className={style.tags}>
                                {projectData.tasks.map((tag, index) => (
                                    <div key={index} className="tag">
                                        {tag}
                                    </div>
                                ))}
                            </div>

                            <AnimatedLink
                                className={`${style.link} onlyMobile`}
                                href={projectData.link}
                                target="_blank"
                            >
                                <GitButton
                                    text={isItalian ? "Visita il sito" : "Live Demo"}
                                />
                            </AnimatedLink>
                        </div>
                    </div>
                </div>
                    </div>
                </>
            )}
            {isLucreziaBrandIdentity ? (
                <LucreziaCurtoBrandIdentity locale={locale} />
            ) : (
                <div
                    className={`${style.carousel} ${
                        projectData.imagesCarousel ? style.imagesCarousel : ""
                    }`}
                >
                    {!projectData.imagesCarousel
                    ? projectData.carousel.map((video, index) => (
                          <div key={index} className={style.carouselItem}>
                              <video autoPlay loop muted playsInline>
                                  <source
                                      src={`/projects/${projectData.assetFolder}/carousel/${video}`}
                                      type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                              </video>
                          </div>
                      ))
                    : projectData.carousel.map((image, index) => (
                          <div key={index} className={style.carouselItem}>
                              <Image
                                  src={`/projects/${projectData.assetFolder}/carousel/${image}`}
                                  alt={getProjectCarouselImageAlt(
                                      projectData,
                                      image,
                                      index
                                  )}
                                  width={360}
                                  height={764}
                              />
                          </div>
                      ))}
                </div>
            )}
            <div className={style.moreProjects}>
                <AnimatedLink className={style.link} href={"/projects"}>
                    <GitButton
                        text={isItalian ? "Altri progetti" : "More Projects"}
                        revertColor={true}
                        leftShift={-35}
                    />
                </AnimatedLink>
            </div>
            <div className={style.nextProject}>
                <h4>{isItalian ? "Progetto successivo" : "Next Project"}</h4>
                <h2
                    className={style.nextProjectTitle}
                    dangerouslySetInnerHTML={{
                        __html: projectData.nextProject?.slogan,
                    }}
                />
                <AnimatedLink
                    className={style.link}
                    href={projectData.nextProject?.path || "/projects"}
                >
                    <GitButton
                        text={isItalian ? "Progetto successivo" : "Next Project"}
                        leftShift={-20}
                    />
                </AnimatedLink>
            </div>
        </>
    );
}
