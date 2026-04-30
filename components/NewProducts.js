import Link from "next/link";
import ProductBox from "./ProductBox";
import Center from "./Center";
import { getCatalogInsights } from "@/lib/storefront";

export default function NewProducts({ newProducts, catalogInsights }) {
  const insights = catalogInsights || getCatalogInsights(newProducts || []);

  return (
    <div className="px-4 pb-14 sm:px-8">
      <Center>
        <section className="theme-shell-light rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
          <div className="mb-8 flex flex-col gap-6 border-b border-[rgba(20,109,126,0.12)] pb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  Catalog highlight
                </span>
                <h2 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)]">New Arrivals</h2>
                <p className="mt-2 max-w-2xl theme-muted-page">
                  Fresh additions with clearer pricing, category context, and stock-aware product cards.
                </p>
              </div>
              <div className="theme-card-light rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                {newProducts?.length || 0} products available now
              </div>
            </div>

            {insights.topCategories.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {insights.topCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={{
                      pathname: "/products",
                      query: { category: category.name },
                    }}
                    className="theme-card-light inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground-strong)] shadow-sm"
                  >
                    <span>{category.name}</span>
                    <span className="rounded-full bg-[rgba(22,125,143,0.1)] px-2 py-1 text-xs text-[var(--brand-strong)]">
                      {category.count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newProducts?.length > 0 ? (
              newProducts.map((product) => (
                <div key={product._id}>
                  <ProductBox {...product} />
                </div>
              ))
            ) : (
              <p className="col-span-full text-center theme-muted-page">No products available.</p>
            )}
          </div>
        </section>
      </Center>
    </div>
  );
}
