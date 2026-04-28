import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import ProductBox from "@/components/ProductBox";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";


export default function ProductsPage({ products }) {
  return (
    <>
      <Head>
        <title>All Product | MyStore</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
              All Products
            </h1>
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id}>
                      <ProductBox {...product} />
                    </div>
                  ))
                ) : (
                  <p className="text-center col-span-4 text-gray-500">
                    No products available.
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
    const products = await Product.find({}, null, { sort: { _id: -1 } });
    return {
      props: {
        products: JSON.parse(JSON.stringify(products)),
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
