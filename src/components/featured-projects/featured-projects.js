import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import AnimatedLink from "@/components/animated-link/animated-link";
import { getProjectData } from "@/lib/projects";
import styles from "./featured-projects.module.css";

const featuredProjects = ["casa-palmi", "gamelia"]
    .map((id) => getProjectData(id))
    .filter(Boolean);

export default function FeaturedProjects() {
    const t = useTranslations("featuredProjects");

    if (featuredProjects.length === 0) return null;

    return (
        <section id="featured-projects" className={styles.section} aria-labelledby="featured-projects-title">
            <div className={styles.container}>
                <h2 id="featured-projects-title" className={styles.title}>{t("title")}</h2>

                <div className={styles.projects}>
                    {featuredProjects.map((project) => (
                        <article key={project.id} className={styles.project}>
                            <div className={styles.projectLabel}>
                                <strong>{project.title}</strong>
                                <span>{t(`${project.id}.category`)}</span>
                            </div>

                            <div className={styles.media}>
                                <Image
                                    src={`/projects/${project.assetFolder}/${project.image}`}
                                    alt={t(`${project.id}.imageAlt`)}
                                    fill
                                    sizes="(max-width: 740px) 88vw, (max-width: 1440px) 40vw, 560px"
                                />
                            </div>

                            <h3>{t(`${project.id}.headline`)}</h3>
                            <p className={styles.description}>{t(`${project.id}.description`)}</p>

                            <AnimatedLink href={project.path} className={styles.projectLink}>
                                {t("exploreProject", { name: project.title })}
                                <ArrowUpRight size={17} aria-hidden="true" />
                            </AnimatedLink>
                        </article>
                    ))}
                </div>

                <div className={styles.footer}>
                    <AnimatedLink href="/projects" className={styles.archiveLink}>
                        {t("allProjects")}
                        <ArrowRight size={18} aria-hidden="true" />
                    </AnimatedLink>
                </div>
            </div>
        </section>
    );
}
