import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { addToast } = useToast();
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('luxe_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    // Keep a ref always pointing at the current cart so we can read it
    // synchronously outside of state updater functions
    const cartRef = useRef(cart);
    useEffect(() => { cartRef.current = cart; }, [cart]);

    useEffect(() => {
        localStorage.setItem('luxe_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        const label = product.name || product.title || 'Item';
        console.log('🛒 CartContext.addToCart called', { productId: product.id, label, quantity });

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });

        // Toast must be called OUTSIDE the state updater (updaters must be pure/side-effect-free)
        // We check the current cart ref to decide which message to show
        const isAlreadyInCart = cartRef.current.find(item => item.id === product.id);
        if (isAlreadyInCart) {
            console.log('📝 Item already in cart, updating quantity');
            addToast(`${label} quantity updated`, 'info');
        } else {
            console.log('✨ Adding new item to cart');
            addToast(`${label} added to cart`, 'success');
        }
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
