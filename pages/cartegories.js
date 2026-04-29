import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { useDeferredValue, useState } from "react";
import { attachCategoryNames } from "@/lib/productCategories";

export default function CategoriesPage({ categories, productsByCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const displayCategories = activeCategory
    ? { [activeCategory]: productsByCategory[activeCategory] }
    : productsByCategory;

  const filteredCategories = Object.entries(displayCategories).reduce(
    (accumulator, [category, products]) => {
      const filteredProducts = products.filter((product) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [product.name, product.description, category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      });

      if (filteredProducts.length) {
        accumulator[category] = filteredProducts;
      }

      return accumulator;
    },
    {}
  );

  return (
    <>
      <Head>
        <title>Categories | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8">
          <div className="panel-surface rounded-[2rem] p-8">
            <div className="border-b border-slate-200 pb-6">
              <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
                Guided browsing
              </span>
              <h1 className="mt-4 text-3xl font-extrabold text-slate-900 mb-3">
              Shop by Category
            </h1>
              <p className="max-w-2xl text-slate-600">
                Jump into a category, then narrow results with a live keyword search.
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-white/70 p-4 shadow-sm">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search inside categories"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === null
                    ? "bg-slate-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products by Category */}
            {Object.entries(filteredCategories).map(([category, products]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  {category}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id}>
                      <ProductBox {...product} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(filteredCategories).length === 0 && (
              <p className="text-center text-slate-500 py-12">
                No products match the current category filter.
              </p>
            )}
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
    const plainProducts = await attachCategoryNames(products);

    const productsByCategory = {};
    for (const product of plainProducts) {
      const cat = product.categoryName || product.category || "Uncategorized";
      if (!productsByCategory[cat]) productsByCategory[cat] = [];
      productsByCategory[cat].push(product);
    }

    return {
      props: {
        categories: Object.keys(productsByCategory),
        productsByCategory,
      },
    };
  } catch (error) {
    console.error("Categories page SSR error:", error);
    return {
      props: {
        categories: [],
        productsByCategory: {},
      },
    };
  }
}
