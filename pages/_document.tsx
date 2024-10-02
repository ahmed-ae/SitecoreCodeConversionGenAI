import { Html, Head, Main, NextScript } from "next/document";
import {GoogleTagManagerWithScript, GoogleTagManagerWithoutScript} from "@/Components/GoogleTagManager";
export default function Document() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || '';
  const structuredData = 
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Sitecore JSS Code Conversion Tool",
              "description": "Convert Sitecore SXA Scriban scripts or Sitecore MVC Razor files into Sitecore JSS Next components using AI.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            }
          ;
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        {/* Core metadata */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />

        {/* Default SEO metadata */}
        <meta
          name="description"
          content="Sitecore JSS Copilot is a code generation and conversion tool for Sitecore JSS, Convert any design into working Sitecore Jss component. It allows you to convert Sitecore SXA Scriban scripts or Sitecore MVC Razor files into Sitecore JSS Next components using AI."
        />
        <meta
          name="keywords"
          content="Sitecore, SXA, Scriban, Razor, JSS, Next.js, code conversion, AI, GPT-4, Claude, Gemini, Sitecore JSS Copilot"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sitecore-gen-ai.vercel.app/" />
        <meta property="og:title" content="Sitecore Code Conversion Tool" />
        <meta
          property="og:description"
          content="Convert Sitecore SXA Scriban scripts or Sitecore MVC Razor files into Sitecore JSS Next components using AI."
        />
        <meta
          property="og:image"
          content="https://sitecore-gen-ai.vercel.app/icon.svg"
        />
        <GoogleTagManagerWithScript gtmId={gtmId} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <body>
        <GoogleTagManagerWithoutScript gtmId={gtmId} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
