import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <Analytics />
      </SessionProvider>
    </>
  );
}
