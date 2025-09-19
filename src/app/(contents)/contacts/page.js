import ContactForm from "@/components/contact-form/contact-form";

export const metadata = {
    title: "Contacts - Kremisi",
    description: "Get in touch with Kremisi for your project needs.",
};

export default function ContactsPage() {
    return (
        <main className="page-content">
            <ContactForm />
        </main>
    );
}
