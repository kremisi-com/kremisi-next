// "use client";
import Script from "next/script";
// import { useEffect } from "react";

export default function Scripts() {
    // useEffect(() => {
    //     function removeIubendaBtn() {
    //         let count = 0;
    //         let timer = setInterval(() => {
    //             const element = document.querySelector(".iubenda-tp-btn");
    //             if (element) {
    //                 element.remove();
    //                 console.log("Iubenda button removed");
    //             }
    //             count++;
    //             if (count >= 200) clearInterval(timer);
    //         }, 100);
    //     }
    //     window.addEventListener("load", removeIubendaBtn);
    //     return () => window.removeEventListener("load", removeIubendaBtn);
    // }, []);

    return (
        <>
            {/* <Script
                src="https://embeds.iubenda.com/widgets/03bd57a9-6e05-46b7-878a-e3bbf4c2ca7f.js"
                strategy="beforeInteractive"
                onLoad={() => {
                    setTimeout(() => {
                        const btn = document.querySelector(".iubenda-tp-btn");
                        if (btn) btn.remove();
                    }, 500);
                }}
            /> */}

            {/* Google Analytics - Bloccato da Iubenda finché non c’è consenso */}
            <Script
                id="ga-src"
                type="text/plain"
                data-type="application/javascript"
                data-iub-purposes="analytics"
                strategy="afterInteractive"
                src="https://www.googletagmanager.com/gtag/js?id=G-TK345YVSSJ"
            />
            <Script
                id="ga-init"
                type="text/plain"
                data-type="application/javascript"
                data-iub-purposes="analytics"
                strategy="afterInteractive"
            >
                {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-TK345YVSSJ');
                    `}
            </Script>
        </>
    );
}
