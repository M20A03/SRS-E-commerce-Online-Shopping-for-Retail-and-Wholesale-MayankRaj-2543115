import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { categories as defaultCategories, products as fallbackProducts } from '../data/mockData';

const useProducts = () => {
  const [products, setProducts] = useState(() => {
    const cached = localStorage.getItem('products_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // If cache is less than 30 minutes old, use it as initial state
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
      } catch (e) {
        console.error('Failed to parse products cache', e);
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(products.length === 0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (snapshot.empty) {
          setProducts(fallbackProducts);
        } else {
          const firestoreProducts = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data()
          }));
          setProducts(firestoreProducts);
          // Update cache
          localStorage.setItem('products_cache', JSON.stringify({
            data: firestoreProducts,
            timestamp: Date.now()
          }));
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        setProducts((prev) => (prev.length === 0 ? fallbackProducts : prev));
        setIsLoading(false);
      }
    );


    return () => unsubscribe();
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => product.isActive !== false), [products]);

  const derivedCategories = useMemo(() => {
    const available = new Set(activeProducts.map((product) => product.category));
    return defaultCategories.filter((category) => available.has(category.id));
  }, [activeProducts]);

  return {
    products: activeProducts,
    allProducts: products,
    categories: derivedCategories.length > 0 ? derivedCategories : defaultCategories,
    isLoading
  };
};

export default useProducts;
