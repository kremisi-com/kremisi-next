import styles from "./intro-seo.module.css";
import Button from "@/components/button/button";

export default function IntroSEO() {
    return (
        <section className={styles.container}>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>
                    Kremisi / Web Design, <br />
                    Sviluppo & Data Analytics
                </h1>
                
                <div className={styles.descriptionWrap}>
                    <p className={styles.description}>
                        Realizziamo prodotti digitali che superano ogni limite. 
                        Dalla strategia al lancio, uniamo design d&apos;avanguardia 
                        e ingegneria robusta per brand ambiziosi.
                    </p>
                    <p className={styles.description}>
                        Siamo un team distribuito con oltre 8 anni di esperienza 
                        nella creazione di esperienze web performanti e scalabili.
                    </p>
                </div>

                <div className={styles.ctaGroup}>
                    <Button href="/contacts" animation={false} className={styles.primaryBtn}>
                        Inizia un progetto
                    </Button>
                    <Button href="/projects" animation={false} className={styles.secondaryBtn}>
                        Scopri i progetti
                    </Button>
                </div>
            </div>
        </section>
    );
}
