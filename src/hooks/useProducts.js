// IMPROVEMENT: Optimised useProducts hook with local storage caching, query limit, and memoized category derivation
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase-config';

const CACHE_KEY = 'roshan_products_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const useProducts = (maxLimit = 100) => {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          return data;
        }
      }
    } catch (e) {
      console.error('Failed to parse products cache', e);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(products.length === 0);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), limit(maxLimit));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const firestoreProducts = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setProducts(firestoreProducts);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: firestoreProducts,
            timestamp: Date.now()
          }));
        } catch (err) {
          console.error('Failed to update products cache:', err);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxLimit]);

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.isActive !== false);
  }, [products]);

  const derivedCategories = useMemo(() => {
    const available = new Set(activeProducts.map((product) => product.category).filter(Boolean));
    return Array.from(available).map((categoryId) => ({
      id: categoryId,
      name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
    }));
  }, [activeProducts]);

  return {
    products: activeProducts,
    allProducts: products,
    categories: derivedCategories,
    isLoading
  };
};

export default useProducts;
