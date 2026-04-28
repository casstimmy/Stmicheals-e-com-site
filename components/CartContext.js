import { createContext, useEffect, useState } from "react";

export const CartContext = createContext({});

export default function CartProvider({ children }) {
  const [cartProducts, setCartProducts] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartProducts(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cartProducts));
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

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        addProductToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
