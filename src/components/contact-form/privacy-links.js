import Script from "next/script";

export default function PrivacyLinks() {
    return (
        <>
            <a
                href="https://www.iubenda.com/privacy-policy/87027585"
                className="iubenda-white iubenda-noiframe iubenda-embed"
                title="Privacy Policy"
            >
                Privacy Policy
            </a>
            {"  "}
            <a
                href="https://www.iubenda.com/privacy-policy/87027585/cookie-policy"
                className="iubenda-white iubenda-noiframe iubenda-embed"
                title="Cookie Policy"
            >
                Cookie Policy
            </a>
            <Script
                strategy="lazyOnload"
                src="https://cdn.iubenda.com/iubenda.js"
            />
        </>
    );
}
