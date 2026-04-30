import Center from "@/components/Center";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
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
import { getReviewSummary } from "@/lib/reviews";
import ProductBox from "@/components/ProductBox";
import { getAvailableInventoryQuantity } from "@/lib/inventory";
import {
  getStorefrontProductById,
  getStorefrontProducts,
} from "@/lib/storefrontCatalog";

export default function ProductPage({ product, relatedProducts }) {
  const galleryImages = normalizeProductImages(product.images);
  const defaultImage = getPrimaryProductImage(product.images);
  const [activeImage, setActiveImage] = useState(defaultImage);
  const { addProductToCart, cartProducts } = useContext(CartContext);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState(product.reviews || []);
  const mainImageRef = useRef(null);
  const reviewSummary = getReviewSummary(reviews);
  const availableQuantity = getAvailableInventoryQuantity(product);
  const isInStock = availableQuantity > 0;
  const cartQuantity = cartProducts.find((item) => item.id === product._id)?.qty || 0;
  const hasReachedCartLimit = isInStock && cartQuantity >= availableQuantity;

  const handleAddToCart = () => {
    if (!isInStock || hasReachedCartLimit) {
      return;
    }

    const productImage = mainImageRef.current;
    const cartIcon = Array.from(document.querySelectorAll("[data-cart-icon]"))
      .find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

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

    addProductToCart(product._id, { maxQuantity: availableQuantity });
  };

  const handleReviewSubmitted = (review) => {
    setReviews((previousReviews) => [review, ...previousReviews]);
  };

  return (
    <>
      <Head>
        <title>{`${product.name} | St Michael's Store`}</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen px-3 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto grid max-w-7xl items-start gap-6 sm:gap-8 md:grid-cols-[3fr_2fr] lg:gap-12">

            {/* Product Images */}
            <div className="theme-shell-light rounded-[1.75rem] p-4 sm:rounded-[2rem] sm:p-6">
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
                    className="h-[320px] w-full rounded-xl border border-white/80 bg-white/60 object-cover shadow-[0_24px_48px_rgba(18,52,60,0.14)] sm:h-[450px]"
                  />
                </AnimatePresence>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto sm:gap-3">
                {(galleryImages.length ? galleryImages : [{ full: PRODUCT_IMAGE_PLACEHOLDER, thumb: PRODUCT_IMAGE_PLACEHOLDER }]).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(image.full)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-20 ${
                      image.full === activeImage
                        ? "border-[var(--brand)]"
                        : "border-transparent hover:border-[rgba(20,109,126,0.28)]"
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
            <div className="theme-shell-light rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-8 md:sticky md:top-32">
              <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.54)]">
                <span className="theme-card-light rounded-full px-3 py-2 shadow-sm text-[var(--foreground-strong)]">
                  {product.categoryName || product.category || "Uncategorized"}
                </span>
                <span className={`rounded-full border px-3 py-2 shadow-sm ${
                  isInStock
                    ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                    : "border-rose-200/80 bg-rose-50 text-rose-700"
                }`}>
                  {isInStock ? `${availableQuantity} in stock` : "Currently unavailable"}
                </span>
              </div>
              <h1 className="mb-4 text-2xl font-bold text-[var(--foreground-strong)] sm:text-3xl">
                {product.name}
              </h1>
              <p className="mb-6 text-base leading-relaxed theme-muted-page">
                {product.description}
              </p>

              <div className="theme-card-light mb-6 grid grid-cols-2 gap-3 rounded-2xl p-4 text-sm shadow-sm sm:flex sm:flex-wrap sm:gap-4">
                <div>
                  <p className="font-semibold text-[var(--foreground-strong)]">Rating</p>
                  <p>{reviewSummary.count ? `${reviewSummary.averageLabel} / 5` : "No ratings yet"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground-strong)]">Reviews</p>
                  <p>{reviewSummary.count} published</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground-strong)]">SKU</p>
                  <p>{product.sku || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground-strong)]">In your cart</p>
                  <p>{cartQuantity}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xl font-semibold text-[var(--accent)] sm:text-2xl">
                  ₦{product.salePriceIncTax?.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm theme-muted-page">
                <p>
                  <span className="font-medium text-[var(--foreground-strong)]">Category:</span>{" "}
                  {product.categoryName || product.category || "Uncategorized"}
                </p>
                <p>
                  <span className="font-medium text-[var(--foreground-strong)]">Availability:</span>{" "}
                  {isInStock ? `${availableQuantity} item(s) available for delivery` : "Out of stock"}
                </p>
              </div>

              <div className="theme-card-light mt-6 rounded-[1.5rem] p-4 text-sm shadow-sm">
                <p className="font-semibold text-[var(--foreground-strong)]">Reservation readiness</p>
                <p className="mt-2 theme-muted-page">
                  {availableQuantity === 0
                    ? "This item is temporarily unavailable. Check related products for alternatives."
                    : `You currently have ${cartQuantity} of ${availableQuantity} available unit${availableQuantity === 1 ? "" : "s"} reserved in your cart.`}
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock || hasReachedCartLimit}
                  className={`w-full rounded-xl py-3 text-lg font-medium transition duration-200 ${
                    isInStock && !hasReachedCartLimit
                      ? "theme-button-accent"
                      : "bg-[rgba(18,52,60,0.08)] cursor-not-allowed text-[rgba(18,52,60,0.4)]"
                  }`}
                >
                  {!isInStock
                    ? "Unavailable"
                    : hasReachedCartLimit
                      ? "Max reserved in cart"
                      : "Add to Cart"}
                </button>
                <Link
                  href="/cart"
                  className="theme-card-light inline-flex items-center justify-center rounded-xl px-4 py-3 text-lg font-medium text-[var(--foreground-strong)] shadow-sm"
                >
                  Review Cart
                </Link>
              </div>
              <Link
                href={{
                  pathname: "/products",
                  query: { category: product.categoryName || product.category || "" },
                }}
                className="mt-4 inline-flex text-sm font-medium text-[var(--brand-strong)]"
              >
                Explore more in this category
              </Link>
            </div>
          </div>
          <div className="theme-shell-light mx-auto mt-8 max-w-7xl rounded-[1.75rem] p-5 sm:mt-12 sm:rounded-[2rem] sm:p-10">
  <h2 className="mb-8 border-b border-[rgba(20,109,126,0.12)] pb-4 text-2xl font-extrabold text-[var(--foreground-strong)] sm:mb-10 sm:text-3xl">
    Customer Reviews
  </h2>

  <div className="theme-card-light mb-8 grid gap-4 rounded-[1.5rem] p-4 shadow-sm sm:p-6 md:grid-cols-3">
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.54)]">Average rating</p>
      <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{reviewSummary.count ? reviewSummary.averageLabel : "New"}</p>
    </div>
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.54)]">Published reviews</p>
      <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{reviewSummary.count}</p>
    </div>
    <div>
      <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.54)]">Fulfillment</p>
      <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{isInStock ? "In stock" : "Paused"}</p>
    </div>
  </div>

  <div className="flex flex-col md:flex-row gap-8">
    <div className="theme-card-light rounded-[1.5rem] p-5 shadow-sm sm:p-8 md:w-1/2">
      <ReviewForm productId={product._id} onSubmitted={handleReviewSubmitted} />
    </div>

    <div className="theme-card-light space-y-6 rounded-[1.5rem] p-5 shadow-sm sm:space-y-8 sm:p-8 md:w-1/2">
  <h3 className="mb-6 border-b border-[rgba(20,109,126,0.12)] pb-4 text-xl font-bold text-[var(--foreground-strong)] sm:text-2xl">
    All Reviews
  </h3>

  {reviews.length > 0 ? (
    reviews.map((review, index) => (
      <div
        key={index}
        className="rounded-2xl border border-[rgba(20,109,126,0.12)] bg-white/80 p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-6"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-lg font-semibold tracking-wide text-[var(--foreground-strong)]">
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

        <h4 className="mb-2 text-xl font-semibold tracking-tight text-[var(--foreground-strong)]">
          {review.title}
        </h4>

        <p className="mb-4 leading-relaxed theme-muted-page">{review.text}</p>

        <p className="font-mono text-xs tracking-wide text-[rgba(18,52,60,0.48)]">
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    ))
  ) : (
    <p className="mt-12 text-center text-lg italic theme-muted-page">
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
                <p className="text-sm uppercase tracking-[0.24em] text-[rgba(18,52,60,0.54)]">Recommended next</p>
                <h2 className="text-3xl font-bold text-[var(--foreground-strong)]">You may also like</h2>
              </div>
              <p className="text-sm theme-muted-page">
                More products from the same catalog flow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
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
    const { id } = context.query;
    const product = await getStorefrontProductById(id);

    if (!product) {
      return {
        notFound: true,
      };
    }

    const catalogProducts = await getStorefrontProducts();
    const relatedProducts = catalogProducts.filter(
      (candidate) => String(candidate._id) !== String(product._id)
    );
    const sameCategoryProducts = relatedProducts.filter(
      (candidate) => candidate.category === product.category
    );
    const resolvedRelatedProducts = (
      sameCategoryProducts.length ? sameCategoryProducts : relatedProducts
    ).slice(0, 4);

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
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
