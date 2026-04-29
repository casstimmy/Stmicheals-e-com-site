import Featured from "@/components/Featured";
import NewProducts from "@/components/NewProducts";
import Header from "@/components/Header";
import Head from "next/head";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { attachCategoryNames } from "@/lib/productCategories";

export default function HomePage({ featuredProduct, newProducts }) {

  return (
    <div>
      <Head>
        <title>St Michael&apos;s Store - Fresh Groceries &amp; Essentials</title>
        <meta name="description" content="Fresh groceries and everyday essentials delivered to your doorstep. Shop at St Michael's Hub and Stores." />
      </Head>
      <Header />
      <Featured product={featuredProduct} />
      <NewProducts newProducts={newProducts} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    await mongooseConnect();

    const featuredProductId = process.env.FEATURED_PRODUCT_ID;
    let featuredProduct = null;
    if (featuredProductId) {
      try {
        featuredProduct = await Product.findById(featuredProductId).lean();
      } catch {
        featuredProduct = null;
      }
    }
    if (!featuredProduct) {
      featuredProduct = await Product.findOne({}, null, { sort: { _id: -1 } }).lean();
    }
    const newProducts = await Product.find({}, null, { sort: { '_id': -1 }, limit: 10 }).lean();
    const [resolvedFeaturedProduct, resolvedNewProducts] = await Promise.all([
      attachCategoryNames(featuredProduct),
      attachCategoryNames(newProducts),
    ]);

    return {
      props: {
        featuredProduct: JSON.parse(JSON.stringify(resolvedFeaturedProduct)),
        newProducts: JSON.parse(JSON.stringify(resolvedNewProducts)),
      },
    };
  } catch (error) {
    console.error("Home page SSR error:", error);
    return {
      props: {
        featuredProduct: null,
        newProducts: [],
      },
    };
  }
}
