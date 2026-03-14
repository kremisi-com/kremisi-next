import ContactForm from "@/components/contact-form/contact-form";

export const metadata = {
    title: "Contact",
    description:
        "Contact Kremisi to discuss your web design or web development project and get a tailored proposal for your business goals.",
    alternates: {
        canonical: "/contacts",
    },
    openGraph: {
        title: "Contact",
        description:
            "Contact Kremisi to discuss your web design or web development project and get a tailored proposal for your business goals.",
        url: "/contacts",
        images: ["/og-image.jpg"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact",
        description:
            "Contact Kremisi to discuss your web design or web development project and get a tailored proposal for your business goals.",
        images: ["/og-image.jpg"],
    },
};

export default function ContactsPage() {
    return (
        <main className="page-content">
            <ContactForm />
        </main>
    );
}
