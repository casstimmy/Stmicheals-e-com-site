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
        <div className="panel-surface relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
          <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[rgba(217,157,78,0.16)] blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-6 h-56 w-56 rounded-full bg-[rgba(18,56,60,0.14)] blur-3xl" />
          <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="text-center md:text-left md:w-1/2">
            <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
              Curated weekly feature
            </span>
            <h1 className="mt-5 text-4xl lg:text-6xl font-extrabold text-white leading-[1.02] mb-4">
              Fresh essentials, refined service, fewer checkout frictions.
            </h1>
            <p className="text-base lg:text-lg theme-muted mb-6 max-w-xl">
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
                  className="theme-card-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-cyan-50 shadow-sm"
                >
                  <FontAwesomeIcon icon={feature.icon} className="text-[var(--accent)]" />
                  {feature.label}
                </span>
              ))}
            </div>
            <div className="mb-8 flex flex-wrap items-end justify-center gap-8 md:justify-start">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Featured product</p>
                <p className="text-2xl font-bold text-white">{product.name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Price</p>
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
              className="w-full h-auto rounded-[1.75rem] shadow-2xl object-cover border border-white/70"
            />
          </div>
        </div>
        </div>
      </Center>
    </div>
  );
}
