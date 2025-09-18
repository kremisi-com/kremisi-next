import RevelatingText from "@/components/revelating-text/revelating-text";
import styles from "./about.module.css";

export default function AboutPage() {
    return (
        <main className={`${styles.main}`}>
            <section className={styles.textSection}>
                <RevelatingText>
                    My name is Andrea and I am a web developer based in Italy
                    with 6+ years of experience in web and app development.{" "}
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
                    <br /> <span className={"highlight"}>Kremisi</span> was
                    created with the goal of developing{" "}
                    <span className={"highlight"}>limitless</span> solutions,
                    giving space to ideas and complex projects in every
                    direction.
                </RevelatingText>
            </section>
            <section className={styles.skillsSection}>
                <div className="">
                    <h2 className={styles.subtitle}>Services / Tech Stack</h2>
                    <ul className={styles.servicesList}>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>HTML</div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>CSS</div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>
                                JavaScript
                            </div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>
                                React Native
                            </div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>
                                React.js
                            </div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>jQuery</div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>PHP</div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>MySQL</div>
                        </li>
                        <li className={styles.rainbowContainer}>
                            <div className={styles.rainbowContent}>
                                WordPress
                            </div>
                        </li>

                        <li className={styles.silver}>Python</li>
                        <li className={styles.silver}>Next.js</li>
                        <li className={styles.silver}>C</li>
                        <li className={styles.silver}>Angular</li>
                        <li className={styles.silver}>Android Studio</li>
                        <li className={styles.silver}>Unity</li>
                        <li className={styles.silver}>Xamarin</li>

                        <li className={styles.bronze}>C#</li>
                        <li className={styles.bronze}>Lua</li>
                        <li className={styles.bronze}>TypeScript</li>
                        <li className={styles.bronze}>Java</li>
                        <li className={styles.bronze}>Lisp</li>
                        <li className={styles.bronze}>Prolog</li>
                        <li className={styles.bronze}>R</li>
                        <li className={styles.bronze}>Assembly</li>
                        <li className={styles.bronze}>Node.js</li>
                    </ul>
                </div>
            </section>
        </main>
    );
}
