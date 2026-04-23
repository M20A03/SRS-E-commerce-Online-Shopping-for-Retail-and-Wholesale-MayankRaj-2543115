import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCSqLi9Iu3CeYOfNH7yPCX32LTyXUR-MBQ',
  authDomain: 'react4-eb851.firebaseapp.com',
  projectId: 'react4-eb851',
  storageBucket: 'react4-eb851.firebasestorage.app',
  messagingSenderId: '438069281435',
  appId: '1:438069281435:web:cfd2d4e5ae3c1706d0fc3e',
  measurementId: 'G-G6VQK5EBKX'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authPanel = document.getElementById('authPanel');
const appPanel = document.getElementById('appPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const createForm = document.getElementById('createForm');
const list = document.getElementById('list');
const errorText = document.getElementById('errorText');
const statusText = document.getElementById('statusText');
const refreshBtn = document.getElementById('refreshBtn');
const rolePanel = document.getElementById('rolePanel');
const roleForm = document.getElementById('roleForm');
const roleEmailInput = document.getElementById('roleEmailInput');
const revokeBtn = document.getElementById('revokeBtn');
const roleStatusText = document.getElementById('roleStatusText');

let currentUserIsSuperAdmin = false;

const clearError = () => {
  errorText.textContent = '';
};

const setError = (message) => {
  errorText.textContent = message || 'Something went wrong.';
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

const setRoleStatus = (message = '') => {
  roleStatusText.textContent = message;
};

const setAdminRoleByEmail = async (email, isAdminValue) => {
  const trimmed = email.trim().toLowerCase();
  const userQuery = query(collection(db, 'users'), where('email', '==', trimmed));
  const snapshot = await getDocs(userQuery);

  if (snapshot.empty) {
    throw new Error('User not found for this email.');
  }

  const targetDoc = snapshot.docs[0];
  await updateDoc(doc(db, 'users', targetDoc.id), {
    isAdmin: isAdminValue,
    updatedAt: new Date().toISOString()
  });
};

const showCustomerMode = () => {
  authPanel.classList.remove('hidden');
  appPanel.classList.add('hidden');
  rolePanel.classList.add('hidden');
  roleForm.reset();
  setRoleStatus('');
  logoutBtn.classList.add('hidden');
};

const showAdminMode = () => {
  authPanel.classList.add('hidden');
  appPanel.classList.remove('hidden');
  if (currentUserIsSuperAdmin) {
    rolePanel.classList.remove('hidden');
  } else {
    rolePanel.classList.add('hidden');
  }
  logoutBtn.classList.remove('hidden');
};

const renderProducts = async () => {
  statusText.textContent = 'Loading products...';
  list.innerHTML = '';

  const productQuery = query(collection(db, 'products'), orderBy('name'));
  const snapshot = await getDocs(productQuery);

  if (snapshot.empty) {
    statusText.textContent = 'No products in database.';
    return;
  }

  statusText.textContent = `${snapshot.size} products found`;

  snapshot.docs.forEach((row) => {
    const product = row.data();
    const item = document.createElement('div');
    item.className = 'item';

    const left = document.createElement('div');
    const title = document.createElement('p');
    title.innerHTML = `<strong>${product.name || 'Unnamed'}</strong>`;

    const meta = document.createElement('p');
    const price = Number(product.price || 0).toFixed(2);
    meta.innerHTML = `Category: ${product.category || 'others'} | Price: Rs ${price} <span class="badge">${product.isActive === false ? 'Hidden' : 'Visible'}</span>`;

    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-soft';
    toggleBtn.textContent = product.isActive === false ? 'Show' : 'Hide';
    toggleBtn.onclick = async () => {
      clearError();
      try {
        await updateDoc(doc(db, 'products', row.id), {
          isActive: !(product.isActive !== false),
          updatedAt: new Date().toISOString()
        });
        await renderProducts();
      } catch (err) {
        setError(err.message);
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      clearError();
      const ok = window.confirm('Delete this product?');
      if (!ok) return;
      try {
        await deleteDoc(doc(db, 'products', row.id));
        await renderProducts();
      } catch (err) {
        setError(err.message);
      }
    };

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(left);
    item.appendChild(actions);
    list.appendChild(item);
  });
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    setError(err.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  clearError();
  try {
    await signOut(auth);
  } catch (err) {
    setError(err.message);
  }
});

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const name = document.getElementById('nameInput').value.trim();
  const price = Number(document.getElementById('priceInput').value);
  const category = document.getElementById('categoryInput').value;
  const image = document.getElementById('imageInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();
  const featured = document.getElementById('featuredInput').checked;
  const isActive = document.getElementById('activeInput').checked;

  if (!name || !image || !description || Number.isNaN(price)) {
    setError('Please fill all product fields correctly.');
    return;
  }

  try {
    await addDoc(collection(db, 'products'), {
      name,
      price,
      category,
      image,
      description,
      featured,
      isActive,
      stock: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    createForm.reset();
    document.getElementById('activeInput').checked = true;
    await renderProducts();
  } catch (err) {
    setError(err.message);
  }
});

refreshBtn.addEventListener('click', async () => {
  clearError();
  try {
    await renderProducts();
  } catch (err) {
    setError(err.message);
  }
});

roleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  if (!currentUserIsSuperAdmin) {
    setError('Only super-admin can grant roles.');
    return;
  }

  try {
    await setAdminRoleByEmail(roleEmailInput.value, true);
    setRoleStatus('Admin role granted successfully.');
  } catch (err) {
    setError(err.message);
  }
});

revokeBtn.addEventListener('click', async () => {
  clearError();

  if (!currentUserIsSuperAdmin) {
    setError('Only super-admin can revoke roles.');
    return;
  }

  try {
    await setAdminRoleByEmail(roleEmailInput.value, false);
    setRoleStatus('Admin role revoked successfully.');
  } catch (err) {
    setError(err.message);
  }
});

onAuthStateChanged(auth, async (currentUser) => {
  clearError();

  if (!currentUser) {
    showCustomerMode();
    return;
  }

  try {
    const admin = await getIsAdmin(currentUser.uid);
    if (!admin) {
      await signOut(auth);
      setError('This account is not admin. Ask for admin role first.');
      showCustomerMode();
      return;
    }

    currentUserIsSuperAdmin = await getIsSuperAdmin(currentUser.uid);
    setRoleStatus(currentUserIsSuperAdmin ? 'Super-admin mode enabled.' : '');

    showAdminMode();
    await renderProducts();
  } catch (err) {
    setError(err.message);
    showCustomerMode();
  }
});
