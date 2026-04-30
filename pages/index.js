import Featured from "@/components/Featured";
import NewProducts from "@/components/NewProducts";
import Header from "@/components/Header";
import Head from "next/head";
import { getCatalogInsights } from "@/lib/storefront";
import {
  getStorefrontProductById,
  getStorefrontProducts,
} from "@/lib/storefrontCatalog";

export default function HomePage({ featuredProduct, newProducts, catalogInsights }) {

  return (
    <div>
      <Head>
        <title>St Michael&apos;s Store - Fresh Groceries &amp; Essentials</title>
        <meta name="description" content="Fresh groceries and everyday essentials delivered to your doorstep. Shop at St Michael's Hub and Stores." />
      </Head>
      <Header />
      <Featured product={featuredProduct} catalogInsights={catalogInsights} />
      <NewProducts newProducts={newProducts} catalogInsights={catalogInsights} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const featuredProductId = process.env.FEATURED_PRODUCT_ID;
    const [resolvedFeaturedProduct, resolvedNewProducts] = await Promise.all([
      getStorefrontProductById(featuredProductId, { fallbackToLatest: true }),
      getStorefrontProducts({ limit: 12 }),
    ]);
    const catalogInsights = getCatalogInsights(resolvedNewProducts);

    return {
      props: {
        featuredProduct: JSON.parse(JSON.stringify(resolvedFeaturedProduct)),
        newProducts: JSON.parse(JSON.stringify(resolvedNewProducts)),
        catalogInsights,
      },
    };
  } catch (error) {
    console.error("Home page SSR error:", error);
    return {
      props: {
        featuredProduct: null,
        newProducts: [],
        catalogInsights: getCatalogInsights([]),
      },
    };
  }
}
