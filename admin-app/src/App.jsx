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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebase';
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

    if (code === 'auth/unauthorized-domain') {
      return 'Google sign-in is not available for this site. Ask a super-admin to check the sign-in configuration.';
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

    const sanitizeFileName = (filename) => String(filename || 'image').replace(/[^a-zA-Z0-9._-]+/g, '_');

    try {
      const storagePath = `products/${Date.now()}_${sanitizeFileName(file.name)}`;
      const uploadedRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(uploadedRef, file, {
        contentType: file.type || 'application/octet-stream'
      });
      return await getDownloadURL(snapshot.ref);
    } catch (uploadError) {
      throw new Error(uploadError?.message || 'Image upload failed. Ensure Firebase Storage is enabled and your client is configured.');
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
