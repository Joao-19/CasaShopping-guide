"use client";

import Script from "next/script";

export function GoogleTagManagerScript({ gtmId }: { gtmId: string }) {
    if (!gtmId) {
        console.error("GTM ID is missing");
        return null;
    }

    return (
        <>
            {/* <!-- Google Tag Manager --> */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${gtmId}');
          `,
                }}
            />
            {/* <!-- End Google Tag Manager --> */}
        </>
    );
}

export function GoogleTagManagerNoscript({ gtmId }: { gtmId: string }) {
    if (!gtmId) {
        return null;
    }

    return (
        <>
            {/* <!-- Google Tag Manager (noscript) --> */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                />
            </noscript>
            {/* <!-- End Google Tag Manager (noscript) --> */}
        </>
    );
}

export function GoogleAnalytics4Script({ gaId }: { gaId: string }) {
    if (!gaId || gaId.startsWith("APP_")) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script
                id="ga4-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
                }}
            />
        </>
    );
}
