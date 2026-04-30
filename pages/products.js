import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import ProductBox from "@/components/ProductBox";
import { getCatalogInsights } from "@/lib/storefront";
import { getStorefrontProducts } from "@/lib/storefrontCatalog";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

const SORT_OPTIONS = new Set(["featured", "price-asc", "price-desc", "name"]);

function readQueryValue(value) {
  return typeof value === "string" ? value : "";
}


export default function ProductsPage({ products }) {
  const router = useRouter();
  const [query, setQuery] = useState(() => readQueryValue(router.query.q));
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const initialCategory = readQueryValue(router.query.category);
    return initialCategory || "all";
  });
  const [sortBy, setSortBy] = useState(() => {
    const initialSort = readQueryValue(router.query.sort);
    return SORT_OPTIONS.has(initialSort) ? initialSort : "featured";
  });
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => [...new Set((products || []).map((product) => product.categoryName || product.category).filter(Boolean))],
    [products]
  );
  const catalogInsights = getCatalogInsights(products || []);
  const normalizedCategoryFilter = categories.includes(categoryFilter) ? categoryFilter : "all";
  const normalizedSortBy = SORT_OPTIONS.has(sortBy) ? sortBy : "featured";
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredProducts = (products || [])
    .filter((product) => {
      const matchesCategory =
        normalizedCategoryFilter === "all" ||
        (product.categoryName || product.category || "") === normalizedCategoryFilter;

      const haystack = [product.name, product.description, product.categoryName, product.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    })
    .sort((leftProduct, rightProduct) => {
      if (normalizedSortBy === "price-asc") {
        return (leftProduct.salePriceIncTax || 0) - (rightProduct.salePriceIncTax || 0);
      }
      if (normalizedSortBy === "price-desc") {
        return (rightProduct.salePriceIncTax || 0) - (leftProduct.salePriceIncTax || 0);
      }
      if (normalizedSortBy === "name") {
        return (leftProduct.name || "").localeCompare(rightProduct.name || "");
      }

      return new Date(rightProduct.createdAt || 0) - new Date(leftProduct.createdAt || 0);
    });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const nextQuery = {};
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      nextQuery.q = trimmedQuery;
    }

    if (normalizedCategoryFilter !== "all") {
      nextQuery.category = normalizedCategoryFilter;
    }

    if (normalizedSortBy !== "featured") {
      nextQuery.sort = normalizedSortBy;
    }

    if (
      readQueryValue(router.query.q) === (nextQuery.q || "") &&
      readQueryValue(router.query.category) === (nextQuery.category || "") &&
      readQueryValue(router.query.sort) === (nextQuery.sort || "")
    ) {
      return;
    }

    router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true, scroll: false }
    );
  }, [normalizedCategoryFilter, normalizedSortBy, query, router]);

  const hasActiveFilters =
    Boolean(query.trim()) || normalizedCategoryFilter !== "all" || normalizedSortBy !== "featured";

  return (
    <>
      <Head>
        <title>All Products | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8">
          <div className="theme-shell-light rounded-[2rem] p-8">
            <div className="flex flex-col gap-6 border-b border-[rgba(20,109,126,0.12)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  Complete catalog
                </span>
                <h1 className="mb-2 mt-4 text-3xl font-extrabold text-[var(--foreground-strong)]">
              All Products
            </h1>
                <p className="max-w-2xl theme-muted-page">
                  Filter by category, search by keyword, sort the catalog, and share the exact view with URL-backed filters.
                </p>
              </div>
              <div className="theme-card-light rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Catalog total</p>
                <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{catalogInsights.productCount}</p>
              </div>
              <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Available now</p>
                <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{catalogInsights.availableCount}</p>
              </div>
              <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Price range</p>
                <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">₦{catalogInsights.minPrice.toLocaleString()}</p>
                <p className="mt-1 text-sm theme-muted-page">Up to ₦{catalogInsights.maxPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="theme-card-light mt-6 grid gap-4 rounded-[1.5rem] p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr]">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, categories, and keywords"
                className="theme-input-light rounded-2xl px-4 py-3 outline-none"
              />
              <select
                value={normalizedCategoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="theme-input-light rounded-2xl px-4 py-3 outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={normalizedSortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="theme-input-light rounded-2xl px-4 py-3 outline-none"
              >
                <option value="featured">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  normalizedCategoryFilter === "all"
                    ? "theme-button-accent"
                    : "theme-card-light text-[var(--foreground-strong)]"
                }`}
              >
                All categories
              </button>
              {catalogInsights.topCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setCategoryFilter(category.name)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    normalizedCategoryFilter === category.name
                      ? "theme-button-accent"
                      : "theme-card-light text-[var(--foreground-strong)]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {hasActiveFilters ? (
                <>
                  <div className="theme-card-light inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--foreground-strong)] shadow-sm">
                    <span className="font-semibold">View</span>
                    <span>
                      {normalizedCategoryFilter === "all" ? "All categories" : normalizedCategoryFilter}
                      {query.trim() ? ` · “${query.trim()}”` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategoryFilter("all");
                      setSortBy("featured");
                    }}
                    className="theme-button-secondary rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Reset filters
                  </button>
                </>
              ) : (
                <p className="text-sm theme-muted-page">
                  Use search, sort, or quick category chips to tighten the catalog view.
                </p>
              )}
              <Link
                href="/categories"
                className="theme-card-light rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground-strong)] shadow-sm"
              >
                Guided category browser
              </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product._id}>
                      <ProductBox {...product} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 rounded-[1.5rem] border border-dashed border-[rgba(20,109,126,0.18)] px-6 py-12 text-center">
                    <p className="theme-muted-page">No products match your current filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setCategoryFilter("all");
                        setSortBy("featured");
                      }}
                      className="theme-button-accent mt-5 rounded-full px-5 py-3 text-sm font-semibold"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Center>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const resolvedProducts = await getStorefrontProducts();
    return {
      props: {
        products: JSON.parse(JSON.stringify(resolvedProducts)),
      },
    };
  } catch (error) {
    console.error("Products page SSR error:", error);
    return {
      props: {
        products: [],
      },
    };
  }
}
