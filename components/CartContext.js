import { createContext, startTransition, useEffect, useState } from "react";

export const CartContext = createContext({});
const CART_STORAGE_KEY = "cart";

export default function CartProvider({ children }) {
  const [cartProducts, setCartProducts] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          startTransition(() => {
            setCartProducts(parsedCart);
          });
        }
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartProducts));
    }
  }, [cartProducts]);

  function addProductToCart(productId) {
    setCartProducts((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (existing) {
        return prev.map((p) =>
          p.id === productId ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { id: productId, qty: 1 }];
    });
  }

  function updateProductQuantity(productId, quantity) {
    setCartProducts((prev) =>
      prev
        .map((product) =>
          product.id === productId
            ? { ...product, qty: Math.max(1, Number(quantity) || 1) }
            : product
        )
        .filter((product) => product.qty > 0)
    );
  }

  function removeProductFromCart(productId) {
    setCartProducts((prev) => prev.filter((product) => product.id !== productId));
  }

  function clearCart() {
    setCartProducts([]);
  }

  const cartCount = cartProducts.reduce(
    (runningTotal, product) => runningTotal + (product.qty || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        cartCount,
        setCartProducts,
        addProductToCart,
        updateProductQuantity,
        removeProductFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
