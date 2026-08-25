import { permanentRedirect } from "next/navigation";

export default async function LucreziaCurtoCaseStudyRedirect({ params }) {
    const { locale } = await params;

    permanentRedirect(`/${locale}/projects/lucrezia-curto-brand-identity`);
}
