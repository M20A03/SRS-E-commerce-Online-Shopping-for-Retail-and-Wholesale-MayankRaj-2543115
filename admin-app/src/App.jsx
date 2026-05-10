import { useEffect, useMemo, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';

const initialProductState = {
  name: '',
  price: '',
  stock: 10,
  category: 'oil',
  image: '',
  imageFile: null,
  images: [],
  imageFiles: [],
  description: '',
  featured: false,
  showOnHomepage: true,
  showInCarousel: false,
  isActive: true
};

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('products');
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
  
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [roleStatus, setRoleStatus] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [productForm, setProductForm] = useState(initialProductState);
  const [roleEmail, setRoleEmail] = useState('');

  useEffect(() => {
    const hashPage = (window.location.hash || '').replace('#', '');
    if (hashPage === 'products' || hashPage === 'orders') {
      setCurrentPage(hashPage);
    }
  }, []);

  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!status) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setStatus('');
    }, 3500);

    return () => clearTimeout(timer);
  }, [status]);

  const mapGoogleError = (error) => {
    const code = error?.code || '';
    const host = typeof window !== 'undefined' ? window.location.host : '';

    if (code === 'auth/unauthorized-domain') {
      return `Google login is blocked for this domain (${host}). Add it in Firebase Authentication -> Settings -> Authorized domains.`;
    }

    if (code === 'auth/popup-blocked') {
      return 'Google popup was blocked by the browser. Allow popups and try again.';
    }

    if (code === 'auth/account-exists-with-different-credential') {
      return 'This email already exists with a different sign-in method. Use email/password once, then link Google if needed.';
    }

    return error?.message || 'Google login failed.';
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [products]);

  const clearMessages = () => {
    setError('');
    setStatus('');
  };

  const getIsAdmin = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return false;
    }
    return snap.data().isAdmin === true;
  };

  const getIsSuperAdmin = async (uid) => {
    const markerRef = doc(db, 'superAdmins', uid);
    const snap = await getDoc(markerRef);
    return snap.exists();
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileToDataUrl = () => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Unable to read image file.'));
      reader.readAsDataURL(file);
    });

    const fileToBase64 = () => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        // result is like "data:<mime>;base64,<data>" — strip the prefix
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error('Unable to read image file.'));
      reader.readAsDataURL(file);
    });

    const estimateDataUrlBytes = (dataUrl) => {
      const base64 = String(dataUrl || '').split(',')[1] || '';
      return Math.floor((base64.length * 3) / 4);
    };

    const optimizeImageForFirestore = async () => {
      // Keep stored data small enough to avoid Firestore document size limit.
      const MAX_DIMENSION = 1280;
      const TARGET_MAX_BYTES = 350 * 1024;

      if (!file.type.startsWith('image/')) {
        return fileToDataUrl();
      }

      const imageSrc = await fileToDataUrl();

      const img = await new Promise((resolve, reject) => {
        const instance = new Image();
        instance.onload = () => resolve(instance);
        instance.onerror = () => reject(new Error('Unable to process image file.'));
        instance.src = imageSrc;
      });

      const ratio = Math.min(1, MAX_DIMENSION / Math.max(img.width || 1, img.height || 1));
      const width = Math.max(1, Math.round((img.width || 1) * ratio));
      const height = Math.max(1, Math.round((img.height || 1) * ratio));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return imageSrc;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      let quality = mimeType === 'image/png' ? undefined : 0.86;
      let output = canvas.toDataURL(mimeType, quality);

      // For jpeg/webp-like files, reduce quality until near target size.
      while (mimeType !== 'image/png' && estimateDataUrlBytes(output) > TARGET_MAX_BYTES && quality > 0.45) {
        quality -= 0.08;
        output = canvas.toDataURL(mimeType, quality);
      }

      return output;
    };

    try {
      const gcsUploadEndpoint = import.meta.env.VITE_GCS_UPLOAD_ENDPOINT;
      const gcsProxyEndpoint = import.meta.env.VITE_GCS_UPLOAD_PROXY_ENDPOINT;

      // If a server-side proxy endpoint is configured, use it (avoids GCS CORS issues)
      if (gcsProxyEndpoint) {
        const base64 = await fileToBase64();
        const proxyRes = await fetch(gcsProxyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', base64 })
        });

        const proxyData = await proxyRes.json();
        if (!proxyRes.ok) throw new Error(proxyData?.error || 'Proxy upload failed');
        return proxyData.publicUrl || '';
      }

      if (gcsUploadEndpoint) {
        const prepareResponse = await fetch(gcsUploadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'application/octet-stream'
          })
        });

        const prepareData = await prepareResponse.json();
        if (!prepareResponse.ok) {
          throw new Error(prepareData?.error || 'Failed to prepare Google Cloud Storage upload.');
        }

        const uploadResponse = await fetch(prepareData.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error('Google Cloud Storage upload failed.');
        }

        return prepareData.publicUrl || prepareData.downloadUrl || '';
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: form
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
        return data.secure_url;
      }

      // No cloud service configured: embed a compressed image directly as a data URL.
      // This works without Storage/Billing, but documents still have size limits.
      const dataUrl = await optimizeImageForFirestore();
      if (estimateDataUrlBytes(dataUrl) > 700 * 1024) {
        throw new Error('Image is too large. Please use a smaller image (recommended under 1 MB) or a URL upload.');
      }
      return dataUrl;
    } catch (uploadError) {
      throw new Error(uploadError.message || 'Image upload failed.');
    }
  };

  const createBulkProducts = async (files, baseProductData) => {
    const fileList = Array.from(files || []).filter(Boolean);

    if (fileList.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    const createdAt = new Date().toISOString();

    for (const [index, file] of fileList.entries()) {
      const image = await uploadImage(file);
      const fallbackName = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      const productName = `${baseProductData.namePrefix || 'Photo'} ${index + 1}`.trim();

      await addDoc(collection(db, 'products'), {
        name: productName || fallbackName || `Photo ${index + 1}`,
        price: Number(baseProductData.price || 0),
        category: baseProductData.category || 'others',
        image,
        description: baseProductData.description || fallbackName || 'Uploaded from device',
        featured: Boolean(baseProductData.featured),
        isActive: Boolean(baseProductData.isActive),
        stock: 10,
        createdAt,
        updatedAt: createdAt,
        uploadBatch: baseProductData.namePrefix || 'bulk-upload'
      });
    }

    return fileList.length;
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    setStatus('Loading products...');

    try {
      const productQuery = query(collection(db, 'products'), orderBy('name'));
      const snapshot = await getDocs(productQuery);
      const rows = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setProducts(rows);
      setStatus(`${rows.length} products loaded.`);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load products.');
      setStatus('');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);

    try {
      const ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));
      const snapshot = await getDocs(ordersQuery);
      const rows = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setOrders(rows);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    clearMessages();

    const previousOrders = [...orders];
    setOrders((prev) => prev.map((item) => (
      item.id === orderId
        ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
        : item
    )));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setStatus(`Order status updated to "${newStatus}".`);
    } catch (updateError) {
      setOrders(previousOrders);
      setError(updateError.message || 'Failed to update order status.');
    }
  };

  const updateProduct = async (productId, payload) => {
    clearMessages();

    await updateDoc(doc(db, 'products', productId), {
      ...payload,
      updatedAt: new Date().toISOString()
    });

    setProducts((prev) => prev.map((item) => (
      item.id === productId ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
    )));
    setStatus('Product updated successfully.');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setError('');
      setStatus('');
      setRoleStatus('');

      if (!user) {
        setAuthUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setProducts([]);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const admin = await getIsAdmin(user.uid);
        if (!admin) {
          await signOut(auth);
          setError('This account is not admin. Ask super-admin for access.');
          setAuthUser(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setProducts([]);
          setIsLoading(false);
          return;
        }

        const superAdmin = await getIsSuperAdmin(user.uid);
        setAuthUser(user);
        setIsAdmin(true);
        setIsSuperAdmin(superAdmin);

        if (superAdmin) {
          setRoleStatus('Super-admin mode enabled. You can grant or revoke admin access.');
        }
      } catch (authError) {
        setError(authError.message || 'Authentication check failed.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser || !isAdmin) {
      return undefined;
    }

    setProductsLoading(true);
    setOrdersLoading(true);

    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));

    const stopProducts = onSnapshot(productsQuery, (snapshot) => {
      const rows = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setProducts(rows);
      setProductsLoading(false);
    }, (loadError) => {
      setError(loadError.message || 'Failed to load products.');
      setProductsLoading(false);
    });

    const stopOrders = onSnapshot(ordersQuery, (snapshot) => {
      const rows = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setOrders(rows);
      setOrdersLoading(false);
    }, (loadError) => {
      setError(loadError.message || 'Failed to load orders.');
      setOrdersLoading(false);
    });

    return () => {
      stopProducts();
      stopOrders();
    };
  }, [authUser, isAdmin]);

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessages();

    try {
      await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.password);
    } catch (loginError) {
      setError(loginError.message || 'Login failed.');
    }
  };

  const handleGoogleLogin = async () => {
    clearMessages();

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (googleError) {
      setError(mapGoogleError(googleError));
    }
  };

  const handleLogout = async () => {
    clearMessages();
    await signOut(auth);
  };

  const handleProductCreate = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!productForm.name.trim() || !productForm.price || !productForm.description.trim()) {
      setError('Please fill all product fields and provide either image URL or upload image.');
      return;
    }

    // require at least one image via URL or files
    if (!productForm.image && (!productForm.imageFiles || productForm.imageFiles.length === 0) && !productForm.imageFile) {
      setError('Please provide at least one image URL or upload one or more image files.');
      return;
    }

    try {
      // assemble images array (supports multiple files)
      const images = [];

      if (productForm.imageFiles && productForm.imageFiles.length) {
        for (const file of productForm.imageFiles) {
          const url = await uploadImage(file);
          images.push(url);
        }
      } else if (productForm.imageFile) {
        const url = await uploadImage(productForm.imageFile);
        images.push(url);
      } else if (productForm.image) {
        images.push(productForm.image.trim());
      }

      await addDoc(collection(db, 'products'), {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        category: productForm.category,
        // legacy single image kept for backwards compatibility
        image: images[0] || '',
        images,
        description: productForm.description.trim(),
        featured: Boolean(productForm.featured),
        showOnHomepage: Boolean(productForm.showOnHomepage),
        showInCarousel: Boolean(productForm.showInCarousel),
        isActive: Boolean(productForm.isActive),
        stock: Number(productForm.stock !== undefined ? productForm.stock : 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setProductForm(initialProductState);
      setStatus('Product added successfully.');
      await loadProducts();
    } catch (createError) {
      setError(createError.message || 'Failed to add product.');
    }
  };

  const toggleVisibility = async (product) => {
    clearMessages();

    try {
      await updateDoc(doc(db, 'products', product.id), {
        isActive: !(product.isActive !== false),
        updatedAt: new Date().toISOString()
      });
      await loadProducts();
    } catch (toggleError) {
      setError(toggleError.message || 'Failed to update product visibility.');
    }
  };

  const toggleCarousel = async (product) => {
    clearMessages();
    try {
      await updateDoc(doc(db, 'products', product.id), {
        showInCarousel: !(product.showInCarousel === true),
        updatedAt: new Date().toISOString()
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to update carousel flag.');
    }
  };

  const removeProduct = async (product) => {
    clearMessages();

    const approved = window.confirm(`Delete ${product.name}?`);
    if (!approved) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', product.id));
      setStatus('Product removed.');
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to remove product.');
    }
  };

  const setAdminRoleByEmail = async (email, value) => {
    const lookupEmail = email.trim().toLowerCase();
    const userQuery = query(collection(db, 'users'), where('email', '==', lookupEmail));
    const snapshot = await getDocs(userQuery);

    if (snapshot.empty) {
      throw new Error('User not found for this email.');
    }

    const targetUserDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'users', targetUserDoc.id), {
      isAdmin: value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleGrant = async (eventOrEmail) => {
    if (eventOrEmail && typeof eventOrEmail.preventDefault === 'function') {
      eventOrEmail.preventDefault();
    }
    setError('');

    if (!isSuperAdmin) {
      setError('Only super-admin can manage roles.');
      return;
    }

    const targetEmail = typeof eventOrEmail === 'string' ? eventOrEmail : roleEmail;
    if (!targetEmail.trim()) {
      setError('Enter an email address.');
      return;
    }

    try {
      await setAdminRoleByEmail(targetEmail, true);
      setRoleStatus('Admin role granted successfully.');
      setRoleEmail('');
    } catch (roleError) {
      setError(roleError.message || 'Failed to grant role.');
    }
  };

  const handleRevoke = async () => {
    setError('');

    if (!isSuperAdmin) {
      setError('Only super-admin can manage roles.');
      return;
    }

    try {
      await setAdminRoleByEmail(roleEmail, false);
      setRoleStatus('Admin role revoked successfully.');
    } catch (roleError) {
      setError(roleError.message || 'Failed to revoke role.');
    }
  };

  return (
    <main className="shell">
      <header className="topbar">
        <h1>Roshan Admin App</h1>
        <div className="nav-tabs">
          {/* ── Theme toggle switch ── */}
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="theme-toggle__icon">{theme === 'light' ? '☀️' : '🌙'}</span>
            <span className="theme-toggle__track">
              <span className="theme-toggle__thumb" />
            </span>
            <span className="theme-toggle__icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {authUser && (
            <>
              <button
                className={`nav-btn ${currentPage === 'products' ? 'is-active' : ''}`}
                onClick={() => setCurrentPage('products')}
              >
                Products
              </button>
              <button
                className={`nav-btn ${currentPage === 'orders' ? 'is-active' : ''}`}
                onClick={() => setCurrentPage('orders')}
              >
                Orders
              </button>
            </>
          )}
          {authUser && <button className="btn btn-soft" onClick={handleLogout} type="button">Logout</button>}
        </div>
      </header>

      {isLoading ? (
        <section className="card">Checking authentication...</section>
      ) : !authUser ? (
        <LoginPage
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          handleGoogleLogin={handleGoogleLogin}
          error={error}
        />
      ) : currentPage === 'products' ? (
        <ProductsPage
          error={error}
          setError={setError}
          status={status}
          setStatus={setStatus}
          clearMessages={clearMessages}
          authUser={authUser}
          handleLogout={handleLogout}
          isSuperAdmin={isSuperAdmin}
          roleStatus={roleStatus}
          roleEmail={roleEmail}
          setRoleEmail={setRoleEmail}
          handleGrant={handleGrant}
          handleRevoke={handleRevoke}
          products={sortedProducts}
          productForm={productForm}
          setProductForm={setProductForm}
          handleProductCreate={handleProductCreate}
          createBulkProducts={createBulkProducts}
          toggleVisibility={toggleVisibility}
          removeProduct={removeProduct}
          updateProduct={updateProduct}
          toggleCarousel={toggleCarousel}
          productsLoading={productsLoading}
          loadProducts={loadProducts}
          uploadImage={uploadImage}
        />
      ) : currentPage === 'orders' ? (
        <OrdersPage
          error={error}
          status={status}
          orders={orders}
          ordersLoading={ordersLoading}
          loadOrders={loadOrders}
          updateOrderStatus={updateOrderStatus}
        />
      ) : null}
    </main>
  );
};

export default App;
