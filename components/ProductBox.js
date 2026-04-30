import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getReviewSummary } from "@/lib/reviews";
import { getAvailableInventoryQuantity } from "@/lib/inventory";

export default function ProductBox({
    _id,
    name,
    description,
    images,
    salePriceIncTax,
    quantity,
    reservedQuantity,
    categoryName,
    category,
    reviews,
}) {
    const { addProductToCart } = useContext(CartContext);
    const url = '/product/' + _id;
    const productImage = getPrimaryProductImage(images);
    const reviewSummary = getReviewSummary(reviews);
    const availableQuantity = getAvailableInventoryQuantity({ quantity, reservedQuantity });
    const isInStock = availableQuantity > 0;

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
        <div className="product-box panel-surface h-full rounded-[1.5rem] overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative w-full h-44 bg-[linear-gradient(180deg,_rgba(5,76,94,0.16),_rgba(255,255,255,0.04))] flex items-center justify-center">
                <div className="theme-card-soft absolute left-3 top-3 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-50 shadow-sm">
                    {categoryName || category || "Featured"}
                </div>
                <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] shadow-sm ${
                    isInStock ? "bg-emerald-200/15 text-emerald-200" : "bg-rose-200/15 text-rose-200"
                }`}>
                    {isInStock ? `${availableQuantity} ready` : "Sold out"}
                </div>
                <Link href={url} className="w-full h-full flex items-center justify-center">
                    <Image
                        src={productImage}
                        alt={name}
                        width={160}
                        height={160}
                        className="h-full object-contain"
                    />
                </Link>
            </div>
            <div className="p-4">
                <Link href={url}>
                    <h2 className="text-md font-semibold text-white truncate">{name}</h2>
                    <p className="text-sm theme-muted mt-1 line-clamp-2 min-h-10">{description}</p>
                </Link>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm theme-muted">
                    <span className="font-semibold text-[var(--accent)]">₦{salePriceIncTax?.toLocaleString()}</span>
                    <span>
                        {reviewSummary.count > 0
                            ? `${reviewSummary.averageLabel} / 5 · ${reviewSummary.count} review${reviewSummary.count === 1 ? "" : "s"}`
                            : "No reviews yet"}
                    </span>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className={`w-full mt-4 text-sm py-2.5 rounded-full transition cursor-pointer ${
                        isInStock
                            ? "theme-button-accent"
                            : "bg-white/10 text-cyan-100/45 cursor-not-allowed"
                    }`}
                >
                    {isInStock ? "Add to Cart" : "Notify Me Later"}
                </button>
            </div>
        </div>
    );
}
