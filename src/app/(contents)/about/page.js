import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./about.module.css";
import ColoredTable from "@/components/colored-table/colored-table";
import Button from "@/components/button/button";
import GitButton from "@/components/git-button/git-button";
import Link from "next/link";
import ColoredList from "@/components/colored-list/colored-list";
import AnimatedLink from "@/components/animated-link/animated-link";

export const metadata = {
    title: "About - Kremisi",
    description:
        "A forward-thinking software company focused on building scalable, high-quality web solutions with innovation and precision.",
};

export default function AboutPage() {
    const skills = [
        { name: "Next.js", level: "rainbow" },
        { name: "TypeScript", level: "rainbow" },
        { name: "React.js", level: "rainbow" },
        { name: "Drizzle ORM", level: "rainbow" },
        { name: "Zod", level: "rainbow" },
        { name: "Zustand", level: "rainbow" },
        { name: "Web Development", level: "rainbow" },
        { name: "SEO Optimization", level: "rainbow" },

        { name: "Data Analysis", level: "silver" },
        { name: "Business Intelligence", level: "silver" },
        { name: "Forecasting", level: "silver" },
        { name: "Recommender Systems", level: "silver" },
        { name: "Predictive Analytics", level: "silver" },
        { name: "Time Series Analysis", level: "silver" },
        { name: "Machine Learning", level: "silver" },
        { name: "Statistical Modeling", level: "silver" },

        { name: "Python", level: "silver" },
        { name: "SQL", level: "silver" },
        { name: "Data Visualization", level: "silver" },
        { name: "KPI Dashboards", level: "silver" },
        { name: "ETL Pipelines", level: "silver" },
        { name: "A/B Testing", level: "silver" },
        { name: "Product Analytics", level: "silver" },
        { name: "Data-Driven Strategy", level: "silver" },

        { name: "Node.js", level: "bronze" },
        { name: "RESTful APIs", level: "bronze" },
        { name: "PostgreSQL", level: "bronze" },
        { name: "UI / UX Design", level: "bronze" },
        { name: "Responsive Design", level: "bronze" },
        { name: "Web Performance", level: "bronze" },
        { name: "Technical SEO", level: "bronze" },
        { name: "GIT", level: "bronze" },
    ];

    return (
        <main className="page-content-simple">
            <section className={styles.section}>
                <RevelatingText>
                    <span className={"highlight"}>Kremisi</span> is a software
                    company based in Italy with{" "}
                    <span className={"highlight"}>8+ years</span> of experience
                    in web and app development.
                    <br />
                    <br />
                    We build digital products that combine web design,
                    development, and strategy to help businesses grow online.
                    <br />
                    <br />We create engaging and functional digital
                    experiences, working on both{" "}
                    <span className={"highlight"}>frontend</span> and{" "}
                    <span className={"highlight"}>backend</span>, with a strong
                    focus on aesthetics and usability.
                    <br />
                    <br /> Kremisi was created with the goal of developing{" "}
                    <span className={"highlight"}>limitless</span> solutions,
                    giving space to ideas and complex projects in every
                    direction.
                </RevelatingText>
            </section>
            <section className={styles.section}>
                <h2>
                    Services /
                    <br className="onlyMobile" /> Tech Stack
                </h2>
                <ColoredList items={skills} />
            </section>
            <section className={styles.section}>
                <h2>Meet The Team</h2>
                <ColoredTable
                    items={[
                        [
                            "Andrea Napolitano",
                            "Founder",
                            "Strategia Digitale - Business Development",
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
                    ]}
                />
            </section>
            <section className={`${styles.section} flex-center`}>
                <AnimatedLink href={"/contacts"}>
                    <GitButton />
                </AnimatedLink>
            </section>
        </main>
    );
}
