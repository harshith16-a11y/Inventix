import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('warehouse_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('warehouse_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.quantity <= 0) return { success: false, message: 'Item out of stock' };

    let addedQty = 0;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.productId === product.productId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantity) {
          addedQty = product.quantity - existing.quantity;
          return prev.map((item) =>
            item.product.productId === product.productId
              ? { ...item, quantity: product.quantity }
              : item
          );
        }
        addedQty = quantity;
        return prev.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(quantity, product.quantity);
      addedQty = initialQty;
      return [...prev, { product, quantity: initialQty }];
    });

    return { success: true, added: addedQty };
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.productId === productId) {
          const clamped = Math.min(newQuantity, item.product.quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalValue,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
