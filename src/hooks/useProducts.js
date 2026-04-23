import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { categories as defaultCategories, products as fallbackProducts } from '../data/mockData';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

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
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading products:', error);
        setProducts(fallbackProducts);
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
