import { useContext } from "react";
import Image from "next/image";
import Center from "./Center";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCartShopping,
  faLeaf,
  faShieldHeart,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { CartContext } from "./CartContext";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getAvailableInventoryQuantity } from "@/lib/inventory";
import { getPublicProductPath, getPublicSitePath } from "@/lib/publicSite";

export default function Featured({ product, catalogInsights, site }) {
  const { addProductToCart, cartProducts } = useContext(CartContext);
  const availableQuantity = getAvailableInventoryQuantity(product);
  const cartQuantity = cartProducts.find((item) => item.id === product._id)?.qty || 0;
  const hasReachedCartLimit = availableQuantity > 0 && cartQuantity >= availableQuantity;
  const canAddFeaturedProduct = availableQuantity > 0 && !hasReachedCartLimit;

  function addFeatureProductToCart() {
    addProductToCart(product._id, { maxQuantity: availableQuantity });
  }

  if (!product) {
    return (
      <div className="px-4 py-16 text-center theme-muted-page sm:px-8">
        We are preparing the featured experience.
      </div>
    );
  }

  const productImage = getPrimaryProductImage(product.images);
  const topCategoryLabel =
    catalogInsights?.topCategories?.map((category) => category.name).join(" · ") ||
    "Everyday essentials";
  const productDescription = product.description?.trim() || "";

  return (
    <div className="px-4 py-16 sm:px-8 lg:py-20">
      <Center>
        <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(20,109,126,0.14)] bg-[linear-gradient(135deg,_rgba(255,252,245,0.98),_rgba(243,248,249,0.96)_52%,_rgba(225,243,246,0.94)_100%)] px-6 py-8 shadow-[0_28px_72px_rgba(18,52,60,0.1)] md:px-10 md:py-12">
          <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[rgba(247,195,46,0.24)] blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-6 h-56 w-56 rounded-full bg-[rgba(20,148,182,0.18)] blur-3xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(11,111,137,0.08),_transparent_58%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-16 md:flex-row">
            <div className="text-center md:w-1/2 md:text-left">
              <span className="inline-flex rounded-full border border-[rgba(216,172,79,0.3)] bg-[rgba(216,172,79,0.15)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(109,76,0,0.9)] shadow-sm">
                {site.heroEyebrow}
              </span>
              <h1 className="mb-4 mt-5 text-4xl font-extrabold leading-[1.02] text-[var(--foreground-strong)] lg:text-6xl">
                {site.heroTitle}
              </h1>
              <p className="mb-6 max-w-xl text-base leading-8 text-[rgba(18,52,60,0.76)] lg:text-lg">
                {productDescription}
                {productDescription ? " " : ""}
                {site.heroDescription}
              </p>

              <div className="mb-8 flex flex-wrap justify-center gap-3 md:justify-start">
                {[
                  { icon: faShieldHeart, label: site.heroHighlights[0] },
                  { icon: faLeaf, label: site.heroHighlights[1] },
                  { icon: faBolt, label: topCategoryLabel },
                ].map((feature) => (
                  <span
                    key={feature.label}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,109,126,0.12)] bg-white/72 px-4 py-2 text-sm font-medium text-[rgba(18,52,60,0.88)] shadow-sm backdrop-blur-sm"
                  >
                    <FontAwesomeIcon icon={feature.icon} className="text-[var(--brand)]" />
                    {feature.label}
                  </span>
                ))}
              </div>

              <div className="mb-8 flex flex-wrap items-end justify-center gap-8 md:justify-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">{site.featuredProductLabel}</p>
                  <p className="text-2xl font-bold text-[var(--foreground-strong)]">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Price</p>
                  <p className="text-3xl font-bold text-[var(--accent)]">₦{product.salePriceIncTax?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Link
                  href={getPublicProductPath(site.key, product._id)}
                  className="theme-button-secondary inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.15rem] px-6 py-3 font-semibold shadow transition duration-300 ease-in-out sm:min-w-[12rem]"
                >
                  View Product Details
                </Link>
                <Link
                  href={getPublicSitePath(site.key, "/categories")}
                  className="theme-card-light inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.15rem] border border-[rgba(20,109,126,0.12)] px-6 py-3 font-semibold text-[var(--foreground-strong)] shadow-sm sm:min-w-[12rem]"
                >
                  {site.secondaryCtaLabel}
                </Link>
                <button
                  onClick={addFeatureProductToCart}
                  disabled={!canAddFeaturedProduct}
                  className={`flex min-h-[3.6rem] items-center justify-center gap-2 rounded-[1.15rem] px-6 py-3 font-semibold shadow transition duration-300 ease-in-out sm:min-w-[12rem] ${
                    canAddFeaturedProduct
                      ? "theme-button-accent cursor-pointer"
                      : "bg-[rgba(18,52,60,0.08)] text-[rgba(18,52,60,0.4)] cursor-not-allowed"
                  }`}
                >
                  <FontAwesomeIcon icon={faCartShopping} />
                  {availableQuantity === 0
                    ? "Unavailable"
                    : hasReachedCartLimit
                      ? "Cart limit reached"
                      : "Add to Cart"}
                </button>
              </div>
              {availableQuantity === 0 && (
                <p className="mt-4 text-sm theme-muted-page">
                  This feature is temporarily unavailable while inventory is refreshed.
                </p>
              )}
            </div>

            <div className="w-full md:w-1/2">
              <div className="relative">
                <Image
                  src={productImage}
                  alt={product.name || "Featured Product"}
                  width={600}
                  height={400}
                  priority
                  sizes="(max-width: 768px) 90vw, 48vw"
                  className="h-auto w-full rounded-[1.75rem] border border-white/80 bg-white/60 object-cover shadow-[0_30px_60px_rgba(18,52,60,0.14)]"
                />
              </div>
            </div>
          </div>
        </div>
      </Center>
    </div>
  );
}
