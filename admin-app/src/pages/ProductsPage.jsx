import { useMemo, useState } from 'react';

export default function ProductsPage({
  error,
  status,
  setStatus,
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
  toggleCarousel,
  productsLoading,
  loadProducts,
  uploadImage
}) {
  const [productSearch, setProductSearch] = useState('');
  const [imageSource, setImageSource] = useState('url');
  const [editingProductId, setEditingProductId] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: 'others',
    description: '',
    isActive: true,
    featured: false,
    showOnHomepage: true,
    showInCarousel: false,
    image: '',
    imageFile: null,
    images: [],
    imageFiles: []
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
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    // if user chose device upload, ensure image URL is cleared
    setImageSource('device');
    setProductForm((prev) => ({ ...prev, image: '' }));
    setProductForm((prev) => ({
      ...prev,
      imageFiles: files,
      imageFile: files[0] || null
    }));
  };

  const handleEditImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setEditForm((prev) => ({
      ...prev,
      imageFiles: files,
      imageFile: files[0]
    }));
  };

  const handleBulkFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setBulkForm((prev) => ({
      ...prev,
      files: selectedFiles
    }));
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();

    if (!bulkForm.files.length) {
      return;
    }

    const uploadedCount = await createBulkProducts(bulkForm.files, bulkForm);
    setStatus?.(`Uploaded ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} successfully.`);
    setBulkForm({
      files: [],
      namePrefix: '',
      price: '',
      category: 'others',
      description: '',
      featured: false,
      isActive: true
    });
  };

  const handleImageUrlChange = (event) => {
    setImageSource('url');
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
      showOnHomepage: product.showOnHomepage !== false,
      showInCarousel: product.showInCarousel === true,
      // populate existing images array if present, fallback to legacy image
      images: Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []),
      image: product.image || (product.images && product.images[0]) || '',
      imageFile: null,
      imageFiles: []
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
      showInCarousel: false,
      image: '',
      imageFile: null,
      images: [],
      imageFiles: []
    });
  };

  const handleSaveEdit = async (productId) => {
    if (!editForm.name.trim() || !editForm.price || !editForm.description.trim()) {
      return;
    }

    // determine final images array for update
    let finalImages = Array.isArray(editForm.images) ? [...editForm.images] : [];

    if (editForm.imageFiles && editForm.imageFiles.length) {
      finalImages = [];
      for (const f of editForm.imageFiles) {
        const url = await uploadImage(f);
        finalImages.push(url);
      }
    } else if (editForm.imageFile) {
      const url = await uploadImage(editForm.imageFile);
      finalImages = [url];
    } else if (editForm.image && finalImages.length === 0) {
      finalImages = [editForm.image.trim()];
    }

    await updateProduct(productId, {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      category: editForm.category,
      description: editForm.description.trim(),
      image: finalImages[0] || '',
      images: finalImages,
      featured: Boolean(editForm.featured),
      showOnHomepage: Boolean(editForm.showOnHomepage),
      showInCarousel: Boolean(editForm.showInCarousel),
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
            <p className="muted">Image Source</p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="imageSource"
                  value="url"
                  checked={imageSource === 'url'}
                  onChange={() => { setImageSource('url'); setProductForm((prev) => ({ ...prev, imageFile: null })); }}
                />
                <span>Use URL</span>
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="radio"
                  name="imageSource"
                  value="device"
                  checked={imageSource === 'device'}
                  onChange={() => { setImageSource('device'); setProductForm((prev) => ({ ...prev, image: '' })); }}
                />
                <span>Upload from Device</span>
              </label>
            </div>

            {imageSource === 'url' && (
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={productForm.image}
                onChange={handleImageUrlChange}
              />
            )}
          </div>

          <div className="image-upload-container">
            <label className="file-input-label">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="file-input-hidden"
                disabled={imageSource !== 'device'}
              />
              <span className="file-input-btn">Upload from Device</span>
            </label>
            {imageSource === 'device' && (
              <p className="muted">Selected: {(productForm.imageFiles && productForm.imageFiles.length) ? productForm.imageFiles.map(f => f.name).join(', ') : (productForm.imageFile ? productForm.imageFile.name : 'None')}</p>
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
              checked={productForm.showOnHomepage !== false}
              onChange={(event) => setProductForm((prev) => ({ ...prev, showOnHomepage: event.target.checked }))}
            />
            <span>Show on Homepage</span>
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={productForm.showInCarousel === true}
              onChange={(event) => setProductForm((prev) => ({ ...prev, showInCarousel: event.target.checked }))}
            />
            <span>Include in Carousel</span>
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
            <span className="muted" style={{ fontWeight: 500, marginRight: '16px' }}>Total: {filteredProducts.length}</span>
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
                        multiple
                        onChange={handleEditImageUpload}
                        className="file-input-hidden"
                      />
                      <span className="file-input-btn">Upload New Image(s)</span>
                    </label>
                    {editForm.imageFiles && editForm.imageFiles.length > 0 && (
                      <p className="muted">Selected: {editForm.imageFiles.map(f => f.name).join(', ')}</p>
                    )}
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
                           checked={editForm.showOnHomepage !== false}
                           onChange={(event) => setEditForm((prev) => ({ ...prev, showOnHomepage: event.target.checked }))}
                         />
                         <span>Show on Homepage</span>
                       </label>
                       <label className="check-row">
                         <input
                           type="checkbox"
                           checked={editForm.showInCarousel === true}
                           onChange={(event) => setEditForm((prev) => ({ ...prev, showInCarousel: event.target.checked }))}
                         />
                         <span>Include in Carousel</span>
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
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {(() => {
                        const imgs = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
                        const src = imgs[0] || '';
                        return src ? (
                          <img src={src} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'grid', placeItems: 'center', fontSize: '10px' }}>No Img</div>
                        );
                      })()}
                      <div>
                        <p><strong>{product.name}</strong></p>
                        <p className="muted">
                          Category: {product.category || 'others'} | Price: Rs {Number(product.price || 0).toFixed(2)}
                          {' '}
                          <span className="badge">{product.isActive === false ? 'Hidden' : 'Visible'}</span>
                          {product.showInCarousel === true && (
                            <span className="badge" style={{ marginLeft: 8, backgroundColor: 'var(--accent-color)', color: '#fff' }}>Carousel</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn btn-soft" type="button" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-soft" type="button" onClick={() => toggleCarousel && toggleCarousel(product)}>
                        {product.showInCarousel === true ? 'Remove from carousel' : 'Add to carousel'}
                      </button>
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
