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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';

const initialProductState = {
  name: '',
  price: '',
  category: 'oil',
  image: '',
  imageFile: null,
  description: '',
  featured: false,
  isActive: true
};

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('products');
  
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

    try {
      const fileName = `products/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (uploadError) {
      throw new Error(uploadError.message || 'Image upload failed.');
    }
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

    if (!productForm.image && !productForm.imageFile) {
      setError('Please provide either image URL or upload image file.');
      return;
    }

    try {
      let finalImageUrl = productForm.image;

      if (productForm.imageFile) {
        finalImageUrl = await uploadImage(productForm.imageFile);
      }

      await addDoc(collection(db, 'products'), {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        category: productForm.category,
        image: finalImageUrl.trim(),
        description: productForm.description.trim(),
        featured: Boolean(productForm.featured),
        isActive: Boolean(productForm.isActive),
        stock: 10,
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

  const handleGrant = async (event) => {
    event.preventDefault();
    setError('');

    if (!isSuperAdmin) {
      setError('Only super-admin can manage roles.');
      return;
    }

    try {
      await setAdminRoleByEmail(roleEmail, true);
      setRoleStatus('Admin role granted successfully.');
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
          toggleVisibility={toggleVisibility}
          removeProduct={removeProduct}
          updateProduct={updateProduct}
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
