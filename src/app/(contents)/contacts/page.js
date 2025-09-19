import RadioOptions from "@/components/radio-options/radio-options";
import styles from "./contacts.module.css";

export const metadata = {
    title: "Contacts - Kremisi",
    description: "Get in touch with Kremisi for your project needs.",
};

export default function ContactsPage() {
    return (
        <main className="page-content">
            <form className={styles.form}>
                <div className="row">
                    <div className="col">
                        <h3>What you need</h3>
                        <RadioOptions
                            options={[
                                { value: "development", label: "Development" },
                                {
                                    value: "design",
                                    label: "Design & Development",
                                },
                            ]}
                            name="service"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h3>Project Budget</h3>
                        <RadioOptions
                            options={[
                                { value: "low", label: "€3-8k" },
                                { value: "medium", label: "€8-12k" },
                                { value: "high", label: "€12-16k" },
                                { value: "very-high", label: "€16k+" },
                            ]}
                            name="budget"
                        />
                    </div>
                    <div className="col">
                        <h3>Delivery Date</h3>
                        <RadioOptions
                            options={[
                                { value: "1-2", label: "1-2 months" },
                                { value: "2-4", label: "2-4 months" },
                                { value: "4-6", label: "4-6 months" },
                            ]}
                            name="delivery"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h3>Details About The Project</h3>
                        <textarea
                            rows="5"
                            placeholder="Write as many details as possible"
                        ></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h3>Contact Info</h3>
                    </div>
                    <div className="col"></div>
                    <div className="col">
                        <input
                            type="text"
                            placeholder="Full Name"
                            name="name"
                        />
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            placeholder="Company"
                            name="company"
                        />
                    </div>
                    <div className="col">
                        <input type="email" placeholder="Email" name="email" />
                    </div>
                    <div className="col">
                        <input type="tel" placeholder="Phone" name="phone" />
                    </div>
                </div>
            </form>
        </main>
    );
}
