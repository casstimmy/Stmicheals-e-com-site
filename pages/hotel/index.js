import SiteHomePage from "@/components/SiteHomePage";
import { getCatalogInsights } from "@/lib/storefront";
import { PUBLIC_SITE_KEYS, getPublicSiteConfig } from "@/lib/publicSite";
import { getStorefrontProductById, getStorefrontProducts } from "@/lib/storefrontCatalog";

export default function HotelHomePage(props) {
  return <SiteHomePage {...props} />;
}

export async function getServerSideProps() {
  try {
    const siteKey = PUBLIC_SITE_KEYS.HOTEL;
    const featuredProductId = process.env.HOTEL_FEATURED_PRODUCT_ID || process.env.FEATURED_PRODUCT_ID;
    const [resolvedFeaturedProduct, resolvedNewProducts] = await Promise.all([
      getStorefrontProductById(featuredProductId, { fallbackToLatest: true, site: siteKey }),
      getStorefrontProducts({ limit: 12, site: siteKey }),
    ]);
    const catalogInsights = getCatalogInsights(resolvedNewProducts);

    return {
      props: {
        site: getPublicSiteConfig(siteKey),
        featuredProduct: JSON.parse(JSON.stringify(resolvedFeaturedProduct)),
        newProducts: JSON.parse(JSON.stringify(resolvedNewProducts)),
        catalogInsights,
      },
    };
  } catch (error) {
    console.error("Hotel home page SSR error:", error);
    return {
      props: {
        site: getPublicSiteConfig(PUBLIC_SITE_KEYS.HOTEL),
        featuredProduct: null,
        newProducts: [],
        catalogInsights: getCatalogInsights([]),
      },
    };
  }
}