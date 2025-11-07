import ContactForm from "@/components/contact-form/contact-form";

export const metadata = {
    title: "Contacts - Kremisi",
    description:
        "Contact us to discuss your project or request a custom solution. We turn your ideas into powerful, efficient digital products.",
};

export default function ContactsPage() {
    return (
        <main className="page-content">
            <ContactForm />
        </main>
    );
}
