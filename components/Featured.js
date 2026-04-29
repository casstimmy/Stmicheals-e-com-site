import { useContext } from "react";
import Image from "next/image";
import Center from "./Center";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
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
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
      <Center>
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-16 max-w-7xl mx-auto px-4">
          {/* Text Content */}
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 leading-snug mb-4">
              {product.description}
            </h1>
            <p className="text-base lg:text-lg text-gray-600 mb-6">
            Fresh groceries and everyday essentials — delivered to your doorstep.
            St Michael’s Hub and Stores brings the full supermarket experience to your home, anywhere in Lagos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link href={`/product/${product._id}`}>
                <button className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700 hover:scale-105 transition duration-300 ease-in-out font-semibold cursor-pointer">
                  Read More
                </button>
              </Link>

              <button onClick={addFeatureProductToCart} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition duration-300 ease-in-out font-semibold flex items-center gap-2 cursor-pointer">
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
              className="w-full h-auto rounded-xl shadow-xl object-cover border border-gray-200"
            />
          </div>
        </div>
      </Center>
    </div>
  );
}
