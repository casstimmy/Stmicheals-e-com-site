import SiteProductsPage from "@/components/SiteProductsPage";
import { PUBLIC_SITE_KEYS, getPublicSiteConfig } from "@/lib/publicSite";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";
import { getActivePublicPromotions } from "@/lib/promotionContent";
import { getHeroContentForSite } from "@/lib/heroContent";

export default function StoreProductsPage(props) {
  return <SiteProductsPage {...props} />;
}

export async function getServerSideProps() {
  try {
    const siteKey = PUBLIC_SITE_KEYS.STORE;
    const [resolvedProducts, activePromotions, heroContent] = await Promise.all([
      getStorefrontProducts({ site: siteKey }),
      getActivePublicPromotions(),
      getHeroContentForSite(siteKey),
    ]);
    return {
      props: {
        site: getPublicSiteConfig(siteKey),
        products: JSON.parse(JSON.stringify(resolvedProducts)),
        activePromotions,
        heroContent,
      },
    };
  } catch (error) {
    console.error("Store products page SSR error:", error);
    return {
      props: {
        site: getPublicSiteConfig(PUBLIC_SITE_KEYS.STORE),
        products: [],
        activePromotions: [],
        heroContent: { activeHero: null, socialLinks: [] },
      },
    };
  }
}