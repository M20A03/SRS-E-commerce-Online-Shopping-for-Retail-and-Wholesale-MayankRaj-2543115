import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const { addToast } = useToast();

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedWishlist = localStorage.getItem('roshan_wishlist');
            if (savedWishlist) {
                setWishlistItems(JSON.parse(savedWishlist));
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        }
    }, []);

    // Save to local storage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('roshan_wishlist', JSON.stringify(wishlistItems));
        } catch (error) {
            console.error('Failed to save wishlist:', error);
        }
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems((prev) => {
            if (prev.some(item => item.id === product.id)) return prev;
            addToast(`${product.name} added to favourites!`, 'success');
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => {
            const newWishlist = prev.filter(item => item.id !== productId);
            if (newWishlist.length < prev.length) {
                addToast('Item removed from favourites.', 'info');
            }
            return newWishlist;
        });
    };

    const toggleWishlist = (product) => {
        if (wishlistItems.some(item => item.id === product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
