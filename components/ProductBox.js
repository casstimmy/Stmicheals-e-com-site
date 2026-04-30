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
    images,
    salePriceIncTax,
    quantity,
    reservedQuantity,
    categoryName,
    category,
    reviews,
}) {
    const { addProductToCart, cartProducts } = useContext(CartContext);
    const url = '/product/' + _id;
    const productImage = getPrimaryProductImage(images);
    const reviewSummary = getReviewSummary(reviews);
    const availableQuantity = getAvailableInventoryQuantity({ quantity, reservedQuantity });
    const isInStock = availableQuantity > 0;
    const cartQuantity = cartProducts.find((item) => item.id === _id)?.qty || 0;
    const hasReachedCartLimit = isInStock && cartQuantity >= availableQuantity;

    const handleAddToCart = (e) => {
        if (!isInStock || hasReachedCartLimit) {
            return;
        }

        const productImage = e.currentTarget.closest(".product-box").querySelector("img");
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

        addProductToCart(_id, { maxQuantity: availableQuantity });
    };

    return (
        <div className="product-box theme-card-light flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[rgba(18,52,60,0.18)] ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(18,52,60,0.14)] sm:rounded-[1.5rem]">
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-white px-3 pb-3 pt-12 sm:h-48 sm:px-4 sm:pb-4 sm:pt-14">
                <div className="theme-card-light absolute left-3 top-3 max-w-[58%] rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[rgba(18,52,60,0.76)] shadow-sm sm:max-w-[55%] sm:text-[0.68rem]">
                    {categoryName || category || "Featured"}
                </div>
                <div className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] shadow-sm ${
                    isInStock
                        ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                        : "border-rose-200/80 bg-rose-50 text-rose-700"
                }`}>
                    {isInStock ? `${availableQuantity} in stock` : "Sold out"}
                </div>
                <Link href={url} className="flex h-full w-full items-center justify-center">
                    <div className="relative h-full w-full max-w-[8.5rem] sm:max-w-[10rem]">
                        <Image
                            src={productImage}
                            alt={name}
                            fill
                            sizes="(max-width: 640px) 74vw, (max-width: 1024px) 30vw, 16vw"
                            className="object-contain"
                        />
                    </div>
                </Link>
            </div>
            <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                <Link href={url}>
                    <h2 className="min-h-[2.85rem] line-clamp-2 text-base font-semibold leading-6 text-[var(--foreground-strong)] sm:min-h-[3.15rem] sm:text-md sm:leading-7">{name}</h2>
                </Link>
                <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3 text-sm text-[rgba(18,52,60,0.62)] sm:mt-4 sm:grid-cols-2">
                    <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.46)]">Price</p>
                        <p className="mt-1 font-semibold text-[var(--accent)]">₦{salePriceIncTax?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.46)]">Reviews</p>
                        <p className="mt-1 text-sm leading-5 text-[rgba(18,52,60,0.72)]">
                            {reviewSummary.count > 0
                                ? `${reviewSummary.averageLabel} / 5 · ${reviewSummary.count} review${reviewSummary.count === 1 ? "" : "s"}`
                                : "No reviews yet"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || hasReachedCartLimit}
                    className={`mt-4 w-full min-h-[3rem] rounded-[1rem] px-4 text-sm font-semibold transition cursor-pointer sm:mt-auto sm:min-h-[3.2rem] sm:rounded-[1.1rem] ${
                        isInStock && !hasReachedCartLimit
                            ? "theme-button-accent"
                            : "bg-[rgba(18,52,60,0.08)] text-[rgba(18,52,60,0.4)] cursor-not-allowed"
                    }`}
                >
                    {!isInStock
                        ? "Sold out"
                        : hasReachedCartLimit
                            ? "Max reserved in cart"
                            : "Add to Cart"}
                </button>
            </div>
        </div>
    );
}
