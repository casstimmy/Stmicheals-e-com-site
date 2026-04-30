import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { attachCategoryNames } from "@/lib/productCategories";
import { useDeferredValue, useState } from "react";


export default function ProductsPage({ products }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const deferredQuery = useDeferredValue(query);

  const categories = [...new Set((products || []).map((product) => product.categoryName || product.category).filter(Boolean))];
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredProducts = (products || [])
    .filter((product) => {
      const matchesCategory =
        categoryFilter === "all" ||
        (product.categoryName || product.category || "") === categoryFilter;

      const haystack = [product.name, product.description, product.categoryName, product.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    })
    .sort((leftProduct, rightProduct) => {
      if (sortBy === "price-asc") {
        return (leftProduct.salePriceIncTax || 0) - (rightProduct.salePriceIncTax || 0);
      }
      if (sortBy === "price-desc") {
        return (rightProduct.salePriceIncTax || 0) - (leftProduct.salePriceIncTax || 0);
      }
      if (sortBy === "name") {
        return (leftProduct.name || "").localeCompare(rightProduct.name || "");
      }

      return new Date(rightProduct.createdAt || 0) - new Date(leftProduct.createdAt || 0);
    });

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
                  Filter by category, search by keyword, and sort the catalog without leaving the page.
                </p>
              </div>
              <div className="theme-card-light rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
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
                value={categoryFilter}
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
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="theme-input-light rounded-2xl px-4 py-3 outline-none"
              >
                <option value="featured">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
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
                  <p className="col-span-4 py-12 text-center theme-muted-page">
                    No products match your current filters.
                  </p>
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
    await mongooseConnect();
    const products = await Product.find({}, null, { sort: { _id: -1 } }).lean();
    const resolvedProducts = await attachCategoryNames(products);
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
