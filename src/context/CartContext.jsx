"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCart, addToCart, removeFromCart, clearCart } from "@/utils/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  function addItem(item) {
    const updatedCart = addToCart(item);
    setCart(updatedCart);
  }

  function removeItem(id) {
    const updatedCart = removeFromCart(id);
    setCart(updatedCart);
  }

  function clearItems() {
    clearCart();
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        addItem,
        removeItem,
        clearItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}