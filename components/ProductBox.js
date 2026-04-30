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

        addProductToCart(_id, { maxQuantity: availableQuantity });
    };

    return (
        <div className="product-box theme-card-light flex h-full flex-col overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(18,52,60,0.14)]">
            <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(20,148,182,0.12),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(237,245,247,0.92))] px-4 pb-4 pt-14">
                <div className="theme-card-light absolute left-3 top-3 max-w-[55%] rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[rgba(18,52,60,0.76)] shadow-sm">
                    {categoryName || category || "Featured"}
                </div>
                <div className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] shadow-sm ${
                    isInStock
                        ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                        : "border-rose-200/80 bg-rose-50 text-rose-700"
                }`}>
                    {isInStock ? `${availableQuantity} ready` : "Sold out"}
                </div>
                <Link href={url} className="flex h-full w-full items-center justify-center">
                    <div className="relative h-full w-full max-w-[10rem]">
                        <Image
                            src={productImage}
                            alt={name}
                            fill
                            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 24vw, 16vw"
                            className="object-contain drop-shadow-[0_14px_28px_rgba(18,52,60,0.14)]"
                        />
                    </div>
                </Link>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <Link href={url}>
                    <h2 className="min-h-[3.25rem] line-clamp-2 text-md font-semibold text-[var(--foreground-strong)]">{name}</h2>
                    <p className="mt-1 min-h-12 line-clamp-2 text-sm leading-6 theme-muted-page">{description}</p>
                </Link>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[rgba(18,52,60,0.62)]">
                    <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.46)]">Price</p>
                        <p className="mt-1 font-semibold text-[var(--accent)]">₦{salePriceIncTax?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.46)]">Reviews</p>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[rgba(18,52,60,0.72)]">
                            {reviewSummary.count > 0
                                ? `${reviewSummary.averageLabel} / 5 · ${reviewSummary.count} review${reviewSummary.count === 1 ? "" : "s"}`
                                : "No reviews yet"}
                        </p>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs theme-muted-page">
                    <span className="rounded-2xl bg-[rgba(22,125,143,0.08)] px-3 py-2">
                        {isInStock ? `${availableQuantity} available` : "Restock pending"}
                    </span>
                    <span className="rounded-2xl bg-[rgba(18,52,60,0.05)] px-3 py-2 text-right">
                        {cartQuantity > 0 ? `${cartQuantity} in cart` : "Not in cart yet"}
                    </span>
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || hasReachedCartLimit}
                    className={`mt-auto w-full min-h-[3.35rem] rounded-[1.1rem] px-4 text-sm font-semibold transition cursor-pointer ${
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
