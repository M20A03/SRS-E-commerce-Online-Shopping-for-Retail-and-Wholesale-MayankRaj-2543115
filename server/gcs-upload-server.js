import http from 'node:http';
import { randomUUID } from 'node:crypto';
import admin from 'firebase-admin';

const PORT = Number(process.env.PORT || 8787);
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
const ORDER_API_PREFIX = '/api/orders';
const SHOULD_ENFORCE_APP_CHECK = process.env.NODE_ENV === 'production';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch {
    console.warn('Firebase Admin initialization failed. Order verification endpoints will be unavailable until application default credentials are configured.');
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;
const appCheckService = typeof admin.appCheck === 'function' ? admin.appCheck() : null;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => {
    if (!raw) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const readBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return '';
  }

  return header.slice(7).trim();
};

const readAppCheckToken = (req) => String(req.headers['x-firebase-appcheck'] || '').trim();

const toMoney = (value) => Number(Number(value || 0).toFixed(2));

const computeCartTotals = async (items = []) => {
  const normalizedItems = items.map((item) => ({
    id: String(item?.id || ''),
    quantity: Math.max(1, Number(item?.quantity || 1))
  })).filter((item) => item.id);

  if (normalizedItems.length === 0) {
    throw new Error('Cart is empty.');
  }

  const resolvedItems = [];
  let subtotal = 0;

  for (const item of normalizedItems) {
    let product = null;

    if (firestore) {
      const productDoc = await firestore.collection('products').doc(item.id).get();
      if (productDoc.exists) {
        product = { id: productDoc.id, ...productDoc.data() };
      }
    }

    if (!product || typeof product.price !== 'number') {
      throw new Error(`Product ${item.id} is unavailable.`);
    }

    const unitPrice = toMoney(product.price);
    const lineTotal = toMoney(unitPrice * item.quantity);
    subtotal = toMoney(subtotal + lineTotal);

    resolvedItems.push({
      id: item.id,
      name: product.name || product.title || item.id,
      image: product.image || '',
      price: unitPrice,
      quantity: item.quantity,
      lineTotal
    });
  }

  const shippingFee = subtotal >= 500 ? 0 : 49;
  const tax = toMoney(subtotal * 0.05);
  const total = toMoney(subtotal + shippingFee + tax);

  return {
    items: resolvedItems,
    subtotal,
    shippingFee,
    tax,
    total
  };
};

const verifyAppCheckToken = async (req) => {
  const token = readAppCheckToken(req);

  if (!token) {
    if (SHOULD_ENFORCE_APP_CHECK) {
      throw new Error('Missing Firebase App Check token.');
    }
    return;
  }

  if (!appCheckService?.verifyToken) {
    if (SHOULD_ENFORCE_APP_CHECK) {
      throw new Error('App Check verification is unavailable on this server.');
    }
    return;
  }

  await appCheckService.verifyToken(token);
};

const createOrder = async (req, res) => {
  if (!firestore) {
    sendJson(res, 503, { error: 'Firestore is not configured for order processing.' });
    return;
  }

  try {
    await verifyAppCheckToken(req);

    const token = readBearerToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'Missing Firebase authentication token.' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const body = await readBody(req);
    const customer = body.customer || {};
    const paymentMethod = String(body.paymentMethod || '').toLowerCase();
    const paymentData = body.paymentData || {};
    const totals = await computeCartTotals(body.items || []);

    const shippingAddress = String(customer.shippingAddress || '').trim();
    const firstName = String(customer.firstName || '').trim();
    const lastName = String(customer.lastName || '').trim();
    const contact = String(customer.contact || '').trim();
    const verifiedEmail = String(decodedToken.email || customer.email || '').trim();

    if (!firstName || !lastName || !contact || !verifiedEmail || !shippingAddress) {
      sendJson(res, 400, { error: 'Missing required customer details.' });
      return;
    }

    if (!['upi', 'cod', 'card'].includes(paymentMethod)) {
      sendJson(res, 400, { error: 'Unsupported payment method.' });
      return;
    }

    if (paymentMethod === 'upi') {
      const providedAmount = toMoney(paymentData.amount);
      if (Math.abs(providedAmount - totals.total) > 0.01) {
        sendJson(res, 400, { error: 'Payment amount must match the server-calculated order total.' });
        return;
      }

      if (!String(paymentData.transactionId || '').trim()) {
        sendJson(res, 400, { error: 'UPI transaction ID is required.' });
        return;
      }
    }

    const now = new Date();
    const estimatedDeliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const orderNumber = `ORD-${randomUUID().split('-')[0].toUpperCase()}`;
    const isCashOnDelivery = paymentMethod === 'cod';
    const isUpi = paymentMethod === 'upi';

    const orderDoc = {
      id: orderNumber,
      userId: decodedToken.uid,
      userEmail: verifiedEmail,
      date: now.toISOString(),
      updatedAt: now.toISOString(),
      estimatedDeliveryDate,
      estimatedDeliveryDaysMin: 2,
      estimatedDeliveryDaysMax: 4,
      items: totals.items,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      tax: totals.tax,
      total: totals.total,
      status: isCashOnDelivery ? 'Confirmed' : isUpi ? 'Pending Payment Verification' : 'Processing',
      paymentMethod,
      paymentStatus: isCashOnDelivery ? 'Pending (Cash on Delivery)' : isUpi ? 'Pending (UPI Payment)' : 'Pending',
      paymentData: isUpi
        ? {
            amount: totals.total,
            upiId: paymentData.upiId || '',
            transactionId: String(paymentData.transactionId || '').trim(),
            timestamp: paymentData.timestamp || now.toISOString()
          }
        : null,
      customer: {
        firstName,
        lastName,
        contact,
        email: verifiedEmail,
        shippingAddress
      }
    };

    const docRef = await firestore.collection('orders').add(orderDoc);

    sendJson(res, 200, {
      ok: true,
      orderId: docRef.id,
      orderNumber,
      total: totals.total,
      paymentStatus: orderDoc.paymentStatus,
      status: orderDoc.status
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error?.message || 'Failed to create order.'
    });
  }
};

// Note: GCS upload endpoints removed. Use Firebase Storage from the admin app for image uploads.

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, firestore: !!firestore });
    return;
  }

  if (req.method === 'POST' && req.url === `${ORDER_API_PREFIX}/create`) {
    await createOrder(req, res);
    return;
  }
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`GCS upload server listening on http://localhost:${PORT}`);
});
