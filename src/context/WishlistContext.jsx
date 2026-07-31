// IMPROVEMENT: Memoized WishlistContext with useCallback/useMemo and toast feedback
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem('roshan_wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('roshan_wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  }, [wishlistItems]);

  const addToWishlist = useCallback((product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      if (addToast) addToast(`${product.name || 'Product'} added to wishlist!`, 'success');
      return [...prev, product];
    });
  }, [addToast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) => {
      const newWishlist = prev.filter((item) => item.id !== productId);
      if (newWishlist.length < prev.length && addToast) {
        addToast('Item removed from wishlist.', 'info');
      }
      return newWishlist;
    });
  }, [addToast]);

  const toggleWishlist = useCallback((product) => {
    if (wishlistItems.some((item) => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [wishlistItems, removeFromWishlist, addToWishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some((item) => item.id === productId);
  }, [wishlistItems]);

  const value = useMemo(() => ({
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist
  }), [wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
