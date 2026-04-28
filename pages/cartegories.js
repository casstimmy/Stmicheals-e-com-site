import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { useState } from "react";

export default function CategoriesPage({ categories, productsByCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const displayCategories = activeCategory
    ? { [activeCategory]: productsByCategory[activeCategory] }
    : productsByCategory;

  return (
    <>
      <Head>
        <title>Categories | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
              Shop by Category
            </h1>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products by Category */}
            {Object.entries(displayCategories).map(([category, products]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-bold text-gray-700 mb-4">
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

            {categories.length === 0 && (
              <p className="text-center text-gray-500 py-12">
                No categories available yet.
              </p>
            )}
          </div>
        </div>
      </Center>
    </>
  );
}

export async function getServerSideProps() {
  await mongooseConnect();
  const products = await Product.find({}, null, { sort: { _id: -1 } });
  const plainProducts = JSON.parse(JSON.stringify(products));

  const productsByCategory = {};
  for (const product of plainProducts) {
    const cat = product.category || "Uncategorized";
    if (!productsByCategory[cat]) productsByCategory[cat] = [];
    productsByCategory[cat].push(product);
  }

  return {
    props: {
      categories: Object.keys(productsByCategory),
      productsByCategory,
    },
  };
}
