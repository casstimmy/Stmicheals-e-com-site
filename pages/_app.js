import CartProvider from "@/components/CartContext";
import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>St Michael’s web Store</title>
        <meta name="description" content="Best products at the best prices!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Add your CartProvider and other providers here */}
       <CartProvider>
        {/* <Header /> */}
        <Component {...pageProps} />
        {/* <Footer /> */}
        </CartProvider>
    </>
  );
}
