import CartProvider from "@/components/CartContext";
import "@/styles/globals.css";
import Head from "next/head";
import { Sora, Rajdhani } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>St Michael&apos;s Store</title>
        <meta
          name="description"
          content="Premium groceries, everyday essentials, and streamlined delivery from St Michael&apos;s Store."
        />
        <meta name="theme-color" content="#12383c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta property="og:title" content="St Michael&apos;s Store" />
        <meta
          property="og:description"
          content="Discover premium groceries, curated essentials, and secure checkout in one storefront."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CartProvider>
        <div className={`${sora.variable} ${rajdhani.variable} app-shell`}>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <main id="main-content">
            <Component {...pageProps} />
          </main>
        </div>
        </CartProvider>
    </>
  );
}
