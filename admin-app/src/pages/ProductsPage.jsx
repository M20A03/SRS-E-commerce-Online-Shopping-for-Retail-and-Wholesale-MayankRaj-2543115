import { useMemo, useState } from 'react';

export default function ProductsPage({
  error,
  status,
  isSuperAdmin,
  roleStatus,
  roleEmail,
  setRoleEmail,
  handleGrant,
  handleRevoke,
  products,
  productForm,
  setProductForm,
  handleProductCreate,
  toggleVisibility,
  removeProduct,
  updateProduct,
  productsLoading,
  loadProducts,
  uploadImage
}) {
  const [productSearch, setProductSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: 'others',
    description: '',
    isActive: true,
    featured: false,
    image: '',
    imageFile: null
  });

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) {
      return products;
    }

    return products.filter((item) => {
      const joined = `${item.name || ''} ${item.category || ''}`.toLowerCase();
      return joined.includes(q);
    });
  }, [products, productSearch]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProductForm((prev) => ({
      ...prev,
      imageFile: file,
      image: prev.image || ''
    }));
  };

  const handleEditImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditForm((prev) => ({
      ...prev,
      imageFile: file
    }));
  };

  const handleImageUrlChange = (event) => {
    setProductForm((prev) => ({
      ...prev,
      image: event.target.value,
      imageFile: null
    }));
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name || '',
      price: String(product.price || ''),
      category: product.category || 'others',
      description: product.description || '',
      isActive: product.isActive !== false,
      featured: Boolean(product.featured),
      image: product.image || '',
      imageFile: null
    });
  };

  const cancelEdit = () => {
    setEditingProductId('');
    setEditForm({
      name: '',
      price: '',
      category: 'others',
      description: '',
      isActive: true,
      featured: false,
      image: '',
      imageFile: null
    });
  };

  const handleSaveEdit = async (productId) => {
    if (!editForm.name.trim() || !editForm.price || !editForm.description.trim()) {
      return;
    }

    let finalImage = editForm.image.trim();
    if (editForm.imageFile) {
      finalImage = await uploadImage(editForm.imageFile);
    }

    await updateProduct(productId, {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      category: editForm.category,
      description: editForm.description.trim(),
      image: finalImage,
      featured: Boolean(editForm.featured),
      isActive: Boolean(editForm.isActive)
    });

    cancelEdit();
  };

  return (
    <>
      {isSuperAdmin && (
        <section className="card">
          <h2>Admin Role Access</h2>
          <p className="muted">Super-admin only: grant or revoke admin access by email.</p>
          <form className="form-grid" onSubmit={handleGrant}>
            <input
              type="email"
              placeholder="user@email.com"
              value={roleEmail}
              onChange={(event) => setRoleEmail(event.target.value)}
              required
            />
            <div className="role-buttons">
              <button className="btn" type="submit">Grant Admin</button>
              <button className="btn btn-soft" type="button" onClick={handleRevoke}>Revoke Admin</button>
            </div>
          </form>
          {roleStatus && <p className="muted">{roleStatus}</p>}
        </section>
      )}

      <section className="card">
        <h2>Add Product</h2>
        <form className="form-grid" onSubmit={handleProductCreate}>
          <input
            type="text"
            placeholder="Product name"
            value={productForm.name}
            onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={productForm.price}
            onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <select
            value={productForm.category}
            onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
          >
            <option value="oil">Oil</option>
            <option value="detergent">Detergent</option>
            <option value="tea">Tea</option>
            <option value="agarbatti">Agarbatti</option>
            <option value="others">Others</option>
          </select>

          <div className="image-upload-container">
            <p className="muted">Image URL</p>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={productForm.image}
              onChange={handleImageUrlChange}
            />
          </div>

          <div className="image-upload-container">
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input-hidden"
              />
              <span className="file-input-btn">Upload from Device</span>
            </label>
            {productForm.imageFile && (
              <p className="muted">Selected: {productForm.imageFile.name}</p>
            )}
          </div>

          <textarea
            rows={3}
            placeholder="Description"
            value={productForm.description}
            onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />

          <label className="check-row">
            <input
              type="checkbox"
              checked={productForm.featured}
              onChange={(event) => setProductForm((prev) => ({ ...prev, featured: event.target.checked }))}
            />
            <span>Featured</span>
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={productForm.isActive}
              onChange={(event) => setProductForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            <span>Visible in store</span>
          </label>

          <button className="btn" type="submit">Add Product</button>
        </form>
        {status && <p className="muted">{status}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <div className="row-title">
          <h2>Manage Products</h2>
          <div className="row-title-actions">
            <input
              className="search-input"
              type="search"
              placeholder="Search by product or category"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <button className="btn btn-soft" type="button" onClick={loadProducts} disabled={productsLoading}>
              {productsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="list">
          {filteredProducts.length === 0 ? (
            <p className="muted">No products found. Add one above!</p>
          ) : (
            filteredProducts.map((product) => (
              <div className="item" key={product.id}>
                {editingProductId === product.id ? (
                  <div className="item-edit-grid">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                    />
                    <select
                      value={editForm.category}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                    >
                      <option value="oil">Oil</option>
                      <option value="detergent">Detergent</option>
                      <option value="tea">Tea</option>
                      <option value="agarbatti">Agarbatti</option>
                      <option value="others">Others</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={editForm.image}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value, imageFile: null }))}
                    />
                    <label className="file-input-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="file-input-hidden"
                      />
                      <span className="file-input-btn">Upload New Image</span>
                    </label>
                    {editForm.imageFile && <p className="muted">Selected: {editForm.imageFile.name}</p>}
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                    <div className="check-row">
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={editForm.featured}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, featured: event.target.checked }))}
                        />
                        <span>Featured</span>
                      </label>
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                        />
                        <span>Visible</span>
                      </label>
                    </div>
                    <div className="item-actions">
                      <button className="btn" type="button" onClick={() => handleSaveEdit(product.id)}>Save</button>
                      <button className="btn btn-soft" type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p><strong>{product.name}</strong></p>
                      <p className="muted">
                        Category: {product.category || 'others'} | Price: Rs {Number(product.price || 0).toFixed(2)}
                        {' '}
                        <span className="badge">{product.isActive === false ? 'Hidden' : 'Visible'}</span>
                      </p>
                    </div>
                    <div className="item-actions">
                      <button className="btn btn-soft" type="button" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-soft" type="button" onClick={() => toggleVisibility(product)}>
                        {product.isActive === false ? 'Show' : 'Hide'}
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => removeProduct(product)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
