import { useContext } from "react";
import Image from "next/image";
import Center from "./Center";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCartShopping,
  faLeaf,
  faShieldHeart,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { CartContext } from "./CartContext";
import { getPrimaryProductImage } from "@/lib/productImages";

export default function Featured({ product }) {


  const {addProductToCart} = useContext(CartContext);
  function addFeatureProductToCart() {
    console.log("Adding product to cart:", product);
    addProductToCart(product._id);
  }
  if (!product) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  const productImage = getPrimaryProductImage(product.images);

  return (
    <div className="py-20">
      <Center>
        <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(20,109,126,0.14)] bg-[linear-gradient(135deg,_rgba(255,252,245,0.98),_rgba(243,248,249,0.96)_52%,_rgba(225,243,246,0.94)_100%)] px-6 py-8 shadow-[0_28px_72px_rgba(18,52,60,0.1)] md:px-10 md:py-12">
          <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[rgba(247,195,46,0.24)] blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-6 h-56 w-56 rounded-full bg-[rgba(20,148,182,0.18)] blur-3xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(11,111,137,0.08),_transparent_58%)]" />
          <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="text-center md:text-left md:w-1/2">
            <span className="inline-flex rounded-full border border-[rgba(247,195,46,0.28)] bg-[rgba(247,195,46,0.16)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(109,76,0,0.9)] shadow-sm">
              Curated weekly feature
            </span>
            <h1 className="mb-4 mt-5 text-4xl font-extrabold leading-[1.02] text-[var(--foreground-strong)] lg:text-6xl">
              Fresh essentials, refined service, fewer checkout frictions.
            </h1>
            <p className="mb-6 max-w-xl text-base leading-8 text-[rgba(18,52,60,0.76)] lg:text-lg">
              {product.description} Shop premium groceries and household staples with cleaner navigation,
              safer payment handling, and delivery-ready stock visibility.
            </p>
            <div className="mb-8 flex flex-wrap justify-center gap-3 md:justify-start">
              {[
                { icon: faShieldHeart, label: "Server-verified checkout" },
                { icon: faLeaf, label: "Fresh curated inventory" },
                { icon: faBolt, label: "Fast category discovery" },
              ].map((feature) => (
                <span
                  key={feature.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,109,126,0.12)] bg-white/72 px-4 py-2 text-sm font-medium text-[rgba(18,52,60,0.88)] shadow-sm backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={feature.icon} className="text-[var(--brand)]" />
                  {feature.label}
                </span>
              ))}
            </div>
            <div className="mb-8 flex flex-wrap items-end justify-center gap-8 md:justify-start">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Featured product</p>
                <p className="text-2xl font-bold text-[var(--foreground-strong)]">{product.name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Price</p>
                <p className="text-3xl font-bold text-[var(--accent)]">₦{product.salePriceIncTax?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link href={`/product/${product._id}`}>
                <button className="theme-button-secondary px-6 py-3 rounded-full shadow transition duration-300 ease-in-out font-semibold cursor-pointer">
                  View Product Details
                </button>
              </Link>

              <button onClick={addFeatureProductToCart} className="theme-button-accent px-6 py-3 rounded-full shadow transition duration-300 ease-in-out font-semibold flex items-center gap-2 cursor-pointer">
                <FontAwesomeIcon icon={faCartShopping} />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
            <Image
              src={productImage}
              alt={product.name || "Featured Product"}
              width={600}
              height={400}
              className="h-auto w-full rounded-[1.75rem] border border-white/80 bg-white/60 object-cover shadow-[0_30px_60px_rgba(18,52,60,0.14)]"
            />
          </div>
        </div>
        </div>
      </Center>
    </div>
  );
}
