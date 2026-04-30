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
import { getReviewSummary } from "@/lib/reviews";
import ProductBox from "@/components/ProductBox";
import { getAvailableInventoryQuantity } from "@/lib/inventory";

export default function ProductPage({ product, relatedProducts }) {
  const galleryImages = normalizeProductImages(product.images);
  const defaultImage = getPrimaryProductImage(product.images);
  const [activeImage, setActiveImage] = useState(defaultImage);
  const { addProductToCart } = useContext(CartContext);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState(product.reviews || []);
  const mainImageRef = useRef(null);
  const reviewSummary = getReviewSummary(reviews);
  const availableQuantity = getAvailableInventoryQuantity(product);
  const isInStock = availableQuantity > 0;

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

  const handleReviewSubmitted = (review) => {
    setReviews((previousReviews) => [review, ...previousReviews]);
  };

  return (
    <>
      <Head>
        <title>{product.name} | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-[3fr_2fr] gap-12 items-start">

            {/* Product Images */}
            <div className="product-box panel-surface rounded-[2rem] p-6">
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
            <div className="panel-surface rounded-[2rem] p-8 md:sticky md:top-32">
              <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                <span className="theme-card-soft rounded-full px-3 py-2 shadow-sm text-cyan-50">
                  {product.categoryName || product.category || "Uncategorized"}
                </span>
                <span className={`rounded-full px-3 py-2 shadow-sm ${
                  isInStock ? "bg-emerald-200/15 text-emerald-100" : "bg-rose-200/15 text-rose-100"
                }`}>
                  {isInStock ? `${availableQuantity} ready now` : "Currently unavailable"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {product.name}
              </h1>
              <p className="theme-muted text-base mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="theme-card-soft mb-6 flex flex-wrap gap-4 rounded-2xl p-4 text-sm text-cyan-50 shadow-sm">
                <div>
                  <p className="font-semibold text-white">Rating</p>
                  <p>{reviewSummary.count ? `${reviewSummary.averageLabel} / 5` : "No ratings yet"}</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Reviews</p>
                  <p>{reviewSummary.count} published</p>
                </div>
                <div>
                  <p className="font-semibold text-white">SKU</p>
                  <p>{product.sku || "Not provided"}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-2xl text-[var(--accent)] font-semibold">
                  ₦{product.salePriceIncTax?.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm theme-muted">
                <p>
                  <span className="font-medium text-white">Category:</span>{" "}
                  {product.categoryName || product.category || "Uncategorized"}
                </p>
                <p>
                  <span className="font-medium text-white">Availability:</span>{" "}
                  {isInStock ? `${availableQuantity} item(s) available for delivery` : "Out of stock"}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`mt-8 w-full text-lg font-medium py-3 rounded-xl transition duration-200 ${
                  isInStock
                    ? "theme-button-accent"
                    : "bg-white/10 cursor-not-allowed text-cyan-100/45"
                }`}
              >
                {isInStock ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          </div>
          <div className="panel-surface max-w-7xl mx-auto mt-12 rounded-[2rem] p-10">
  <h2 className="text-3xl font-extrabold mb-10 text-white border-b border-cyan-200/10 pb-4">
    Customer Reviews
  </h2>

  <div className="theme-card-soft mb-8 grid gap-4 rounded-[1.5rem] p-6 shadow-sm md:grid-cols-3">
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Average rating</p>
      <p className="mt-2 text-3xl font-bold text-white">{reviewSummary.count ? reviewSummary.averageLabel : "New"}</p>
    </div>
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Published reviews</p>
      <p className="mt-2 text-3xl font-bold text-white">{reviewSummary.count}</p>
    </div>
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Fulfillment</p>
      <p className="mt-2 text-3xl font-bold text-white">{isInStock ? "Ready" : "Paused"}</p>
    </div>
  </div>

  <div className="flex flex-col md:flex-row gap-8">
    {/* Review Form - 50% width on md+ */}
    <div className="md:w-1/2 theme-card-soft p-8 rounded-lg shadow-inner">
      <ReviewForm productId={product._id} onSubmitted={handleReviewSubmitted} />
    </div>

    {/* Reviews List - 50% width on md+ */}
    <div className="md:w-1/2 space-y-8 theme-card-soft p-8 rounded-lg shadow-inner">
  <h3 className="text-2xl font-bold text-white border-b border-cyan-200/10 pb-4 mb-6">
    All Reviews
  </h3>

  {reviews.length > 0 ? (
    reviews.map((review, index) => (
      <div
        key={index}
        className="rounded-2xl border border-cyan-200/10 bg-white/6 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-white text-lg tracking-wide">
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

        <h4 className="font-semibold text-xl text-white mb-2 tracking-tight">
          {review.title}
        </h4>

        <p className="theme-muted leading-relaxed mb-4">{review.text}</p>

        <p className="text-xs text-cyan-100/45 tracking-wide font-mono">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    ))
  ) : (
    <p className="theme-muted italic text-center mt-12 text-lg">
      No reviews yet. Be the first to review this product!
    </p>
  )}
</div>

  </div>
</div>


        </div>

        {relatedProducts?.length > 0 && (
          <div className="max-w-7xl mx-auto mt-12">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">Recommended next</p>
                <h2 className="text-3xl font-bold text-white">You may also like</h2>
              </div>
              <p className="text-sm theme-muted">
                More products from the same catalog flow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id}>
                  <ProductBox {...relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
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

    const relatedProductsQuery = product.category
      ? { _id: { $ne: product._id }, category: product.category }
      : { _id: { $ne: product._id } };

    const relatedProducts = await Product.find(relatedProductsQuery, null, {
      sort: { _id: -1 },
      limit: 4,
    }).lean();

    const [resolvedProduct, resolvedRelatedProducts] = await Promise.all([
      attachCategoryNames(product),
      attachCategoryNames(relatedProducts),
    ]);

    return {
      props: {
        product: JSON.parse(JSON.stringify(resolvedProduct)),
        relatedProducts: JSON.parse(JSON.stringify(resolvedRelatedProducts)),
      },
    };
  } catch (error) {
    console.error("Product page SSR error:", error);
    return {
      notFound: true,
    };
  }
}
