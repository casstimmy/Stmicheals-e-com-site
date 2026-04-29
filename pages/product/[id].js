import Center from "@/components/Center";
import Header from "@/components/Header";
import Image from "next/image";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { useContext, useState, useRef } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@/components/CartContext";
import ReviewForm from "@/components/ReviewForm";
import {
  getPrimaryProductImage,
  normalizeProductImages,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/productImages";
import { attachCategoryNames } from "@/lib/productCategories";

export default function ProductPage({ product }) {
  const galleryImages = normalizeProductImages(product.images);
  const defaultImage = getPrimaryProductImage(product.images);
  const [activeImage, setActiveImage] = useState(defaultImage);
  const { addProductToCart } = useContext(CartContext);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainImageRef = useRef(null);

  const handleAddToCart = () => {
    const productImage = mainImageRef.current;
    const cartIcon = document.getElementById("cart-icon");

    if (productImage && cartIcon) {
      const imgClone = productImage.cloneNode(true);
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      imgClone.style.position = "fixed";
      imgClone.style.left = `${imgRect.left}px`;
      imgClone.style.top = `${imgRect.top}px`;
      imgClone.style.width = `${imgRect.width}px`;
      imgClone.style.height = `${imgRect.height}px`;
      imgClone.style.zIndex = 1000;
      imgClone.style.transition = "all 0.7s ease-in-out";
      imgClone.style.opacity = 0.8;

      document.body.appendChild(imgClone);

      requestAnimationFrame(() => {
        imgClone.style.left = `${cartRect.left + cartRect.width / 2}px`;
        imgClone.style.top = `${cartRect.top + cartRect.height / 2}px`;
        imgClone.style.width = "20px";
        imgClone.style.height = "20px";
        imgClone.style.opacity = 0;
      });

      imgClone.addEventListener("transitionend", () => {
        imgClone.remove();
      });
    }

    addProductToCart(product._id);
  };

  return (
    <>
      <Head>
        <title>{product.name} | MyStore</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-[3fr_2fr] gap-12 items-start">

            {/* Product Images */}
            <div className="product-box bg-white rounded-2xl shadow-xl p-6">
              <div className="cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    ref={mainImageRef}
                    src={activeImage || PRODUCT_IMAGE_PLACEHOLDER}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-[450px] object-cover rounded-xl border border-gray-200"
                  />
                </AnimatePresence>
              </div>

              <div className="flex mt-4 gap-3 overflow-x-auto">
                {(galleryImages.length ? galleryImages : [{ full: PRODUCT_IMAGE_PLACEHOLDER, thumb: PRODUCT_IMAGE_PLACEHOLDER }]).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(image.full)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 ${
                      image.full === activeImage
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.thumb}
                      alt={`Product thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-6">
                <p className="text-2xl text-blue-600 font-semibold">
                  ₦{product.salePriceIncTax?.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-gray-500">
                <p>
                  <span className="font-medium text-gray-700">Category:</span>{" "}
                  {product.categoryName || product.category || "Uncategorized"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">SKU:</span>{" "}
                  {product.sku}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 rounded-xl transition duration-200"
              >
                Add to Cart
              </button>
            </div>
          </div>
          <div className="bg-white max-w-7xl mx-auto mt-12 rounded-2xl shadow-lg p-10">
  <h2 className="text-3xl font-extrabold mb-10 text-gray-900 border-b border-gray-200 pb-4">
    Customer Reviews
  </h2>

  <div className="flex flex-col md:flex-row gap-8">
    {/* Review Form - 50% width on md+ */}
    <div className="md:w-1/2 bg-gray-50 p-8 rounded-lg shadow-inner">
      <ReviewForm productId={product._id} />
    </div>

    {/* Reviews List - 50% width on md+ */}
    <div className="md:w-1/2 space-y-8 bg-gray-50 p-8 rounded-lg shadow-inner">
  <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-4 mb-6">
    All Reviews
  </h3>

  {product.reviews?.length > 0 ? (
    product.reviews.map((review, index) => (
      <div
        key={index}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-gray-900 text-lg tracking-wide">
            {review.customerName || "Anonymous"}
          </p>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < review.rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
              </svg>
            ))}
          </div>
        </div>

        <h4 className="font-semibold text-xl text-gray-800 mb-2 tracking-tight">
          {review.title}
        </h4>

        <p className="text-gray-700 leading-relaxed mb-4">{review.text}</p>

        <p className="text-xs text-gray-400 tracking-wide font-mono">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    ))
  ) : (
    <p className="text-gray-500 italic text-center mt-12 text-lg">
      No reviews yet. Be the first to review this product!
    </p>
  )}
</div>

  </div>
</div>


        </div>
      </Center>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <Image
            src={activeImage || PRODUCT_IMAGE_PLACEHOLDER}
            alt="Full View"
            width={1200}
            height={900}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
      
        
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    await mongooseConnect();
    const { id } = context.query;
    const product = await Product.findById(id).lean();

    if (!product) {
      return {
        notFound: true,
      };
    }

    const resolvedProduct = await attachCategoryNames(product);

    return {
      props: {
        product: JSON.parse(JSON.stringify(resolvedProduct)),
      },
    };
  } catch (error) {
    console.error("Product page SSR error:", error);
    return {
      notFound: true,
    };
  }
}
