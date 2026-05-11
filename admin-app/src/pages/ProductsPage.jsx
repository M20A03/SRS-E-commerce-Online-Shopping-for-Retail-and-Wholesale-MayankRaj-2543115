import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProductsPage({
  error,
  status,
  authUser,
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
  const [accessRequests, setAccessRequests] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: 10,
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

  // Per-product quick stock editing (outside the full edit modal)
  const [stockEdits, setStockEdits] = useState({});
  const [savingStock, setSavingStock] = useState({});

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((item) => {
      const joined = `${item.name || ''} ${item.category || ''}`.toLowerCase();
      return joined.includes(q);
    });
  }, [products, productSearch]);

  const pendingAccessRequests = useMemo(() => {
    const pending = accessRequests.filter((request) => (request.status || 'pending') === 'pending');
    const latestByEmail = {};
    for (const request of pending) {
      const email = request.email?.toLowerCase();
      if (!email) continue;
      const current = latestByEmail[email];
      if (!current || new Date(request.createdAt) > new Date(current.createdAt)) {
        latestByEmail[email] = request;
      }
    }
    return Object.values(latestByEmail);
  }, [accessRequests]);

  useEffect(() => {
    const requestsQuery = query(collection(db, 'adminAccessRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      setAccessRequests(snapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data()
      })));
    });

    return () => unsubscribe();
  }, []);

  // Stock color coding
  const getStockClass = (stock) => {
    const s = Number(stock ?? 10);
    if (s === 0) return 'stock-badge--out';
    if (s <= 10) return 'stock-badge--low';
    return 'stock-badge--ok';
  };

  const getStockLabel = (stock) => {
    const s = Number(stock ?? 10);
    if (s === 0) return '⚠ Out of Stock';
    if (s <= 10) return `⚡ ${s} left`;
    return `✓ ${s} in stock`;
  };

  const handleQuickStockChange = (productId, value) => {
    setStockEdits(prev => ({ ...prev, [productId]: value }));
  };

  const handleQuickStockStep = (productId, currentVal, delta) => {
    const next = Math.max(0, Number(currentVal ?? 0) + delta);
    setStockEdits(prev => ({ ...prev, [productId]: String(next) }));
  };

  const handleSaveStock = async (productId, rawVal) => {
    const val = Math.max(0, Number(rawVal));
    setSavingStock(prev => ({ ...prev, [productId]: true }));
    try {
      await updateProduct(productId, { stock: val });
      setStockEdits(prev => { const n = { ...prev }; delete n[productId]; return n; });
    } finally {
      setSavingStock(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
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

  const handleApproveRequest = async (request) => {
    await handleGrant(request.email);
    await updateDoc(doc(db, 'adminAccessRequests', request.id), {
      status: 'approved',
      updatedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: authUser?.email || 'super-admin'
    });
  };

  const handleDismissRequest = async (request) => {
    await updateDoc(doc(db, 'adminAccessRequests', request.id), {
      status: 'rejected',
      updatedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: authUser?.email || 'super-admin'
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
      stock: product.stock !== undefined ? product.stock : 10,
      category: product.category || 'others',
      description: product.description || '',
      isActive: product.isActive !== false,
      featured: Boolean(product.featured),
      showOnHomepage: product.showOnHomepage !== false,
      showInCarousel: product.showInCarousel === true,
      images: Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []),
      image: product.image || (product.images && product.images[0]) || '',
      imageFile: null,
      imageFiles: []
    });
  };

  const cancelEdit = () => {
    setEditingProductId('');
    setEditForm({
      name: '', price: '', stock: 10, category: 'others', description: '',
      isActive: true, featured: false, showInCarousel: false,
      image: '', imageFile: null, images: [], imageFiles: []
    });
  };

  const handleSaveEdit = async (productId) => {
    if (!editForm.name.trim() || !editForm.price || !editForm.description.trim()) return;

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
      stock: Number(editForm.stock),
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
            placeholder="Price (₹)"
            value={productForm.price}
            onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Stock Quantity"
            value={productForm.stock !== undefined ? productForm.stock : ''}
            onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
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
              <span className="file-input-btn">📁 Upload from Device</span>
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
            <input type="checkbox" checked={productForm.featured} onChange={(event) => setProductForm((prev) => ({ ...prev, featured: event.target.checked }))} />
            <span>Featured</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={productForm.showOnHomepage !== false} onChange={(event) => setProductForm((prev) => ({ ...prev, showOnHomepage: event.target.checked }))} />
            <span>Show on Homepage</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={productForm.showInCarousel === true} onChange={(event) => setProductForm((prev) => ({ ...prev, showInCarousel: event.target.checked }))} />
            <span>Include in Carousel</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={productForm.isActive} onChange={(event) => setProductForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
            <span>Visible in store</span>
          </label>

          <button className="btn" type="submit">Add Product</button>
        </form>
        {status && <p className="muted">{status}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      {isSuperAdmin && (
        <section className="card">
          <h2>Admin Access Requests</h2>
          <p className="muted">Super-admin only: review users who requested access from their account page.</p>

          {pendingAccessRequests.length === 0 ? (
            <p className="muted">No pending access requests.</p>
          ) : (
            <div className="list" style={{ gap: '1rem' }}>
              {pendingAccessRequests.map((request) => (
                <div className="item" key={request.id}>
                  <div className="item-edit-grid" style={{ width: '100%' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.25rem' }}>{request.displayName || 'Unknown user'}</h3>
                      <p className="muted" style={{ marginBottom: '0.35rem' }}>{request.email}</p>
                      <p className="muted" style={{ fontSize: '0.9rem' }}>{request.reason || 'No reason provided.'}</p>
                      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                        Requested: {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button className="btn" type="button" onClick={() => handleApproveRequest(request)}>
                        Grant Access
                      </button>
                      <button className="btn btn-soft" type="button" onClick={() => handleDismissRequest(request)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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
        <div className="row-title">
          <h2>Manage Products</h2>
          <div className="row-title-actions">
            <span className="muted" style={{ fontWeight: 500 }}>Total: {filteredProducts.length}</span>
            <input
              className="search-input"
              type="search"
              placeholder="Search by name or category"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <button className="btn btn-soft" type="button" onClick={loadProducts} disabled={productsLoading}>
              {productsLoading ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        <div className="list">
          {filteredProducts.length === 0 ? (
            <p className="muted">No products found. Add one above!</p>
          ) : (
            filteredProducts.map((product) => {
              const currentStock = stockEdits[product.id] !== undefined
                ? stockEdits[product.id]
                : String(product.stock !== undefined ? product.stock : 10);
              const stockDirty = stockEdits[product.id] !== undefined && stockEdits[product.id] !== String(product.stock !== undefined ? product.stock : 10);

              return (
                <div className="item" key={product.id}>
                  {editingProductId === product.id ? (
                    <div className="item-edit-grid">
                      <input type="text" value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Product name" />
                      <input type="number" min="0" step="0.01" placeholder="Price (₹)" value={editForm.price} onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))} />
                      <input type="number" min="0" step="1" placeholder="Stock Quantity" value={editForm.stock} onChange={(event) => setEditForm((prev) => ({ ...prev, stock: event.target.value }))} />
                      <select value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}>
                        <option value="oil">Oil</option>
                        <option value="detergent">Detergent</option>
                        <option value="tea">Tea</option>
                        <option value="agarbatti">Agarbatti</option>
                        <option value="others">Others</option>
                      </select>
                      <input type="url" placeholder="Image URL (optional)" value={editForm.image} onChange={(event) => setEditForm((prev) => ({ ...prev, image: event.target.value, imageFile: null }))} />
                      <label className="file-input-label">
                        <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="file-input-hidden" />
                        <span className="file-input-btn">📁 Upload New Image(s)</span>
                      </label>
                      {editForm.imageFiles && editForm.imageFiles.length > 0 && (
                        <p className="muted">Selected: {editForm.imageFiles.map(f => f.name).join(', ')}</p>
                      )}
                      <textarea rows={2} value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" />
                      <div className="check-row">
                        <label className="check-row"><input type="checkbox" checked={editForm.featured} onChange={(event) => setEditForm((prev) => ({ ...prev, featured: event.target.checked }))} /><span>Featured</span></label>
                        <label className="check-row"><input type="checkbox" checked={editForm.showOnHomepage !== false} onChange={(event) => setEditForm((prev) => ({ ...prev, showOnHomepage: event.target.checked }))} /><span>Homepage</span></label>
                        <label className="check-row"><input type="checkbox" checked={editForm.showInCarousel === true} onChange={(event) => setEditForm((prev) => ({ ...prev, showInCarousel: event.target.checked }))} /><span>Carousel</span></label>
                        <label className="check-row"><input type="checkbox" checked={editForm.isActive} onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))} /><span>Visible</span></label>
                      </div>
                      <div className="item-actions">
                        <button className="btn" type="button" onClick={() => handleSaveEdit(product.id)}>Save</button>
                        <button className="btn btn-soft" type="button" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ── Product info left side ── */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        {(() => {
                          const imgs = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
                          const src = imgs[0] || '';
                          return src ? (
                            <img src={src} alt={product.name} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }} />
                          ) : (
                            <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'grid', placeItems: 'center', fontSize: '10px', flexShrink: 0, border: '1px solid var(--border-color)', color: 'var(--text-tertiary)' }}>No Img</div>
                          );
                        })()}
                        <div style={{ minWidth: 0 }}>
                          <p><strong style={{ fontSize: '0.95rem' }}>{product.name}</strong></p>
                          <p className="muted" style={{ fontSize: '0.82rem', margin: '2px 0 6px' }}>
                            {product.category || 'others'} · ₹{Number(product.price || 0).toFixed(2)}
                            {' '}
                            <span className="badge">{product.isActive === false ? 'Hidden' : 'Visible'}</span>
                            {product.showInCarousel === true && (
                              <span className="badge" style={{ marginLeft: 6, background: 'var(--accent-light)', color: 'var(--accent-color)' }}>Carousel</span>
                            )}
                          </p>

                          {/* ── Stock quick-editor ── */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`stock-badge ${getStockClass(product.stock)}`}>
                              {getStockLabel(product.stock)}
                            </span>
                            <div className="stock-editor">
                              <button
                                type="button"
                                className="stock-editor__btn"
                                onClick={() => handleQuickStockStep(product.id, currentStock, -1)}
                                aria-label="Decrease stock"
                              >−</button>
                              <input
                                type="number"
                                className="stock-editor__input"
                                min="0"
                                value={currentStock}
                                onChange={(e) => handleQuickStockChange(product.id, e.target.value)}
                                aria-label={`Stock for ${product.name}`}
                              />
                              <button
                                type="button"
                                className="stock-editor__btn"
                                onClick={() => handleQuickStockStep(product.id, currentStock, 1)}
                                aria-label="Increase stock"
                              >+</button>
                            </div>
                            {stockDirty && (
                              <button
                                type="button"
                                className="btn stock-editor__save"
                                onClick={() => handleSaveStock(product.id, currentStock)}
                                disabled={savingStock[product.id]}
                              >
                                {savingStock[product.id] ? '…' : 'Save'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Actions right side ── */}
                      <div className="item-actions">
                        <button className="btn btn-soft" type="button" onClick={() => startEdit(product)}>Edit</button>
                        <button className="btn btn-soft" type="button" onClick={() => toggleCarousel && toggleCarousel(product)}>
                          {product.showInCarousel === true ? 'Remove carousel' : 'Add carousel'}
                        </button>
                        <button className="btn btn-soft" type="button" onClick={() => toggleVisibility(product)}>
                          {product.isActive === false ? 'Show' : 'Hide'}
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => removeProduct(product)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
