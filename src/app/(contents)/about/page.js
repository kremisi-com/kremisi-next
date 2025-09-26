import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./about.module.css";
import ColoredTable from "@/components/colored-table/colored-table";
import Button from "@/components/button/button";
import GitButton from "@/components/git-button/git-button";
import Link from "next/link";
import ColoredList from "@/components/colored-list/colored-list";

export const metadata = {
    title: "About - Kremisi",
    description: "Learn more about Kremisi and the services offered.",
};

export default function AboutPage() {
    const skills = [
        { name: "HTML", level: "rainbow" },
        { name: "CSS", level: "rainbow" },
        { name: "JavaScript", level: "rainbow" },
        { name: "React Native", level: "rainbow" },
        { name: "React.js", level: "rainbow" },
        { name: "jQuery", level: "rainbow" },
        { name: "PHP", level: "rainbow" },
        { name: "MySQL", level: "rainbow" },
        { name: "WordPress", level: "rainbow" },

        { name: "Python", level: "silver" },
        { name: "Next.js", level: "silver" },
        { name: "C", level: "silver" },
        { name: "Angular", level: "silver" },
        { name: "Android Studio", level: "silver" },
        { name: "Unity", level: "silver" },
        { name: "Xamarin", level: "silver" },

        { name: "C#", level: "bronze" },
        { name: "Lua", level: "bronze" },
        { name: "TypeScript", level: "bronze" },
        { name: "Java", level: "bronze" },
        { name: "Lisp", level: "bronze" },
        { name: "Prolog", level: "bronze" },
        { name: "R", level: "bronze" },
        { name: "Assembly", level: "bronze" },
        { name: "Node.js", level: "bronze" },
    ];

    return (
        <main className="page-content">
            <section className={styles.section}>
                <RevelatingText>
                    My name is Andrea and I am a web developer based in Italy
                    with <span className={"highlight"}>8+ years</span> of
                    experience in web and app development.
                    <br />
                    <br />
                    <span className={"highlight"}>Kremisi</span> is my personal
                    project, born from my passion for web design and
                    programming.
                    <br />
                    <br />I love creating engaging and functional digital
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
                <h2>Experience</h2>
                <ColoredTable
                    items={[
                        [
                            "Kremisi",
                            "Founder & Developer",
                            "Apr. 2022 - Present",
                        ],
                        ["Makuda", "Web Developer", "Jan. 2021 - Dec. 2024"],
                        ["Fleder", "App Developer", "Oct. 2021 - Jan. 2023"],
                        [
                            "Il-Cubo",
                            "Web & App Developer",
                            "Jan. 2019 - Jan. 2021",
                        ],
                    ]}
                />
            </section>
            <section className={styles.section}>
                <h2>Recognitions</h2>
                <ColoredTable
                    items={[
                        [
                            "First Place - National RoboCup Competition",
                            "<a target='_blank' href='https://www.varesenews.it/2018/04/facchinetti-vince-la-romecup-un-ballo-uomo-robot/711029/'>Read the Article</a>",
                            "April 2018, Rome, Italy",
                        ],
                        [
                            "Second Place - Microsoft Hackathon",
                            "<a target='_blank' href='https://startupitalia.eu/education/scuola/tutti-i-vincitori-dellhackathon-microsoft-connected-ability/#:~:text=Pi%C3%B9%20visionaria%20e,non%20pu%C3%B2%20vederle.'>Read the Article</a>",
                            "Dec. 2017, Milan, Italy",
                        ],
                    ]}
                    images={[
                        "/images/recognitions/aurat.png",
                        "/images/recognitions/microsoft.png",
                    ]}
                />
            </section>
            <section className={`${styles.section} flex-center`}>
                <Link href={"/contacts"}>
                    <GitButton />
                </Link>
            </section>
        </main>
    );
}
