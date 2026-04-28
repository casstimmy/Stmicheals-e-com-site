import Link from "next/link";
import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function ProductBox({ _id, name, description, images, salePriceIncTax }) {
    const { addProductToCart } = useContext(CartContext);
    const url = '/product/' + _id;

    const handleClick = () => {
        window.location.href = url;
    };

    const handleAddToCart = (e) => {
        const productImage = e.currentTarget.closest(".product-box").querySelector("img");
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

        addProductToCart(_id);
    };

    return (
        <div className="product-box bg-white shadow-sm rounded-lg overflow-hidden transition hover:shadow-md">
            <div className="w-full h-40 bg-white flex items-center justify-center">
                <Link href={url} className="w-full h-full flex items-center justify-center" onClick={handleClick}>
                    <img
                        src={images?.[0] || "/placeholder.jpg"}
                        alt={name}
                        className="h-full object-contain"
                    />
                </Link>
            </div>
            <div className="p-3">
                <Link href={url} onClick={handleClick}>
                    <h2 className="text-md font-semibold text-gray-900 truncate">{name}</h2>
                    <p className="text-sm text-gray-500 mt-1 truncate">{description}</p>
                </Link>
                <p className="text-sm font-bold text-blue-600 mt-1">₦{salePriceIncTax?.toLocaleString()}</p>
                <button
                    onClick={handleAddToCart}
                    className="w-full mt-3 bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700 transition cursor-pointer"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
