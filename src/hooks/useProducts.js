import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

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
        const firestoreProducts = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        }));
        setProducts(firestoreProducts);
        localStorage.setItem('products_cache', JSON.stringify({
          data: firestoreProducts,
          timestamp: Date.now()
        }));
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        setProducts([]);
        setIsLoading(false);
      }
    );


    return () => unsubscribe();
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => product.isActive !== false), [products]);

  const derivedCategories = useMemo(() => {
    const available = new Set(activeProducts.map((product) => product.category));
    return Array.from(available).map((categoryId) => ({ id: categoryId, name: categoryId }));
  }, [activeProducts]);

  return {
    products: activeProducts,
    allProducts: products,
    categories: derivedCategories,
    isLoading
  };
};

export default useProducts;
