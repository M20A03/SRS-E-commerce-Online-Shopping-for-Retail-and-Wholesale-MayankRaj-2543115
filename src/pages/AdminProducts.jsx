import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../context/AuthContext';
import useProducts from '../hooks/useProducts';
import { categories as defaultCategories } from '../data/mockData';
import './AdminProducts.css';

const AdminProducts = () => {
  const { user } = useAuth();
  const { allProducts, isLoading } = useProducts();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: defaultCategories[0]?.id || 'others',
    image: '',
    description: '',
    featured: false,
    isActive: true
  });

  const sortedProducts = useMemo(() => {
    return [...allProducts].sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  if (!user) {
    return null;
  }

  if (!user.isAdmin) {
    return (
      <div className="container section animate-fade-in">
        <div className="card admin-products__empty">
          <h2 className="heading-2">Not Authorized</h2>
          <p className="text-muted">Only admin accounts can access product management.</p>
          <Link to="/account" className="btn btn-primary">Back to Account</Link>
        </div>
      </div>
    );
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setError('');

    if (!newProduct.name.trim() || !newProduct.price || !newProduct.image.trim() || !newProduct.description.trim()) {
      setError('Please complete all product fields.');
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        image: newProduct.image.trim(),
        description: newProduct.description.trim(),
        featured: Boolean(newProduct.featured),
        isActive: Boolean(newProduct.isActive),
        stock: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewProduct({
        name: '',
        price: '',
        category: defaultCategories[0]?.id || 'others',
        image: '',
        description: '',
        featured: false,
        isActive: true
      });
      window.location.reload();
    } catch (createError) {
      setError(createError.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (productId, currentValue) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: !currentValue,
        updatedAt: new Date().toISOString()
      });
      window.location.reload();
    } catch (toggleError) {
      setError(toggleError.message || 'Failed to update visibility.');
    }
  };

  const removeProduct = async (productId) => {
    const shouldDelete = window.confirm('Delete this product from store?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      window.location.reload();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="container section animate-fade-in">
      <div className="admin-products__header">
        <div>
          <h1 className="heading-1">Admin Product Manager</h1>
          <p className="text-muted">Choose which products should be visible, add new items, or remove old items.</p>
        </div>
        <Link to="/categories" className="btn btn-outline">View Store</Link>
      </div>

      {error && <div className="admin-products__error">{error}</div>}

      <div className="card admin-products__form-wrap">
        <h3 className="heading-3">Add Product</h3>
        <form className="admin-products__form" onSubmit={handleCreateProduct}>
          <input className="input" placeholder="Product name" value={newProduct.name} onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} />
          <input className="input" type="number" min="1" step="0.01" placeholder="Price" value={newProduct.price} onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} />
          <select className="input" value={newProduct.category} onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}>
            {defaultCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input className="input" placeholder="Image URL" value={newProduct.image} onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))} />
          <textarea className="input" rows="3" placeholder="Description" value={newProduct.description} onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))} />

          <label className="admin-products__check">
            <input type="checkbox" checked={newProduct.featured} onChange={(event) => setNewProduct((prev) => ({ ...prev, featured: event.target.checked }))} />
            <span>Featured product</span>
          </label>

          <label className="admin-products__check">
            <input type="checkbox" checked={newProduct.isActive} onChange={(event) => setNewProduct((prev) => ({ ...prev, isActive: event.target.checked }))} />
            <span>Visible in store</span>
          </label>

          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Product'}</button>
        </form>
      </div>

      <div className="card admin-products__table-wrap">
        <h3 className="heading-3">Manage Products</h3>
        {isLoading ? (
          <p className="text-muted">Loading products...</p>
        ) : (
          <div className="admin-products__list">
            {sortedProducts.map((product) => (
              <div key={product.id} className="admin-products__row">
                <div>
                  <strong>{product.name}</strong>
                  <p className="text-muted">{product.category} • Rs {Number(product.price || 0).toFixed(2)}</p>
                </div>
                <div className="admin-products__row-actions">
                  <button className="btn btn-outline" onClick={() => toggleActive(product.id, product.isActive !== false)}>
                    {product.isActive === false ? 'Show' : 'Hide'}
                  </button>
                  <button className="btn btn-outline admin-products__delete" onClick={() => removeProduct(product.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
