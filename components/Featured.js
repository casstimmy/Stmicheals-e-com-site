import { useContext } from "react";
import Image from "next/image";
import Center from "./Center";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
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
  const topCategories = catalogInsights?.topCategories || [];
  const normalizedDescription = product.description?.trim() || "";
  const productDescription =
    normalizedDescription && normalizedDescription.toLowerCase() !== (product.name || "").trim().toLowerCase()
      ? normalizedDescription
      : "";
  const catalogStats = [
    {
      label: "Ready to order",
      value: `${catalogInsights?.availableCount || 0}`,
      meta: "stock-aware items",
    },
    {
      label: "Active aisles",
      value: `${catalogInsights?.categoryCount || 0}`,
      meta: "clear category routes",
    },
    {
      label: "Price entry",
      value: `₦${catalogInsights?.minPrice?.toLocaleString?.() || "0"}`,
      meta: "from current catalog",
    },
  ];

  return (
    <div className="px-4 py-12 sm:px-8 lg:py-16">
      <Center>
        <section className="store-shell rounded-[2rem] px-6 py-7 md:px-8 md:py-9 lg:px-10 lg:py-10">
          <div className="relative mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
            <div>
              <span className="store-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
                {site.heroEyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] text-[var(--foreground-strong)] lg:text-[4.25rem]">
                {site.heroTitle}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 store-shell-muted lg:text-lg">
                {site.heroDescription}
              </p>
              {productDescription ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(18,52,60,0.66)] sm:text-base">
                  Featured pick: {productDescription}
                </p>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {catalogStats.map((stat) => (
                  <div key={stat.label} className="store-shell-card rounded-[1.35rem] px-4 py-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.5)]">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-bold text-[var(--foreground-strong)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm store-shell-muted">{stat.meta}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-[rgba(31,44,51,0.08)] bg-[rgba(255,255,255,0.56)] p-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-[rgba(31,44,51,0.08)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.5)]">
                      Browse with context
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--foreground-strong)]">
                      Shop the warehouse by real demand, not clutter.
                    </h2>
                  </div>
                  <Link
                    href={getPublicSitePath(site.key, "/products")}
                    className="store-button-secondary inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold"
                  >
                    Browse full catalog
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {topCategories.length > 0 ? (
                    topCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={{
                          pathname: getPublicSitePath(site.key, "/products"),
                          query: { category: category.name },
                        }}
                        className="store-button-secondary inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium"
                      >
                        <span>{category.name}</span>
                        <span className="rounded-full bg-[rgba(31,44,51,0.08)] px-2 py-1 text-xs font-semibold text-[rgba(18,52,60,0.72)]">
                          {category.count}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm store-shell-muted">
                      Categories will appear here as more warehouse products are published.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={getPublicProductPath(site.key, product._id)}
                  className="store-button-primary inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.1rem] px-6 py-3 font-semibold sm:min-w-[12rem]"
                >
                  View featured item
                </Link>
                <Link
                  href={getPublicSitePath(site.key, "/categories")}
                  className="store-button-secondary inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.1rem] px-6 py-3 font-semibold sm:min-w-[12rem]"
                >
                  {site.secondaryCtaLabel}
                </Link>
                <button
                  onClick={addFeatureProductToCart}
                  disabled={!canAddFeaturedProduct}
                  className={`flex min-h-[3.6rem] items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 font-semibold transition sm:min-w-[12rem] ${
                    canAddFeaturedProduct
                      ? "store-button-accent cursor-pointer"
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

            <div className="grid gap-4">
              <div className="store-shell-card rounded-[1.75rem] p-4 sm:p-5">
                <div className="rounded-[1.5rem] border border-[rgba(31,44,51,0.08)] bg-[rgba(255,255,255,0.9)] p-4">
                  <div className="aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,_rgba(248,243,236,0.96),_rgba(255,255,255,0.98))]">
                <Image
                  src={productImage}
                  alt={product.name || "Featured Product"}
                  width={600}
                  height={400}
                  priority
                  sizes="(max-width: 768px) 90vw, 48vw"
                      className="h-full w-full object-contain p-4"
                />
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.5)]">
                      {site.featuredProductLabel}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--foreground-strong)]">
                      {product.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.5)]">
                      Price
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#8d5a1f]">
                      ₦{product.salePriceIncTax?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.15rem] border border-[rgba(31,44,51,0.08)] bg-[rgba(247,243,236,0.8)] px-4 py-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[rgba(18,52,60,0.48)]">
                      Category
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
                      {product.categoryName || product.category || "Uncategorized"}
                    </p>
                  </div>
                  <div className="rounded-[1.15rem] border border-[rgba(31,44,51,0.08)] bg-[rgba(247,243,236,0.8)] px-4 py-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[rgba(18,52,60,0.48)]">
                      Availability
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground-strong)]">
                      {availableQuantity > 0 ? `${availableQuantity} ready for delivery` : "Temporarily unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="store-shell-card rounded-[1.5rem] px-5 py-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.48)]">
                    Checkout standard
                  </p>
                  <p className="mt-3 text-base font-semibold text-[var(--foreground-strong)]">
                    Server checks price, stock, and delivery totals before payment starts.
                  </p>
                </div>
                <div className="store-shell-card rounded-[1.5rem] px-5 py-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.48)]">
                    Best for
                  </p>
                  <p className="mt-3 text-base font-semibold text-[var(--foreground-strong)]">
                    Repeat household orders, pantry restocks, and quick beverage replenishment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Center>
    </div>
  );
}
