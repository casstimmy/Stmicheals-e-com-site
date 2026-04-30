import SiteProductsPage from "@/components/SiteProductsPage";
import { PUBLIC_SITE_KEYS, getPublicSiteConfig } from "@/lib/publicSite";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";

export default function HotelProductsPage(props) {
  return <SiteProductsPage {...props} />;
}

export async function getServerSideProps() {
  try {
    const siteKey = PUBLIC_SITE_KEYS.HOTEL;
    const resolvedProducts = await getStorefrontProducts({ site: siteKey });
    return {
      props: {
        site: getPublicSiteConfig(siteKey),
        products: JSON.parse(JSON.stringify(resolvedProducts)),
      },
    };
  } catch (error) {
    console.error("Hotel products page SSR error:", error);
    return {
      props: {
        site: getPublicSiteConfig(PUBLIC_SITE_KEYS.HOTEL),
        products: [],
      },
    };
  }
}