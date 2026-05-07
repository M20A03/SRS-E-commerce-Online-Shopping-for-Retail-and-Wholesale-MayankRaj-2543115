/*
Simple migration script to normalize product documents:
- Ensure `images` is an array (migrate from legacy `image` if present)
- Ensure `showInCarousel` exists (default to `featured` value)

Usage:
  1. Place service account JSON and set GOOGLE_APPLICATION_CREDENTIALS env var, or run on a machine with gcloud credentials.
  2. Install dependencies: `npm install firebase-admin`
  3. Run: `node scripts/migrate-products.js`

This script updates every document in the `products` collection.
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function migrate() {
  console.log('Starting migration: products -> ensure images[] and showInCarousel');
  const snapshot = await db.collection('products').get();
  console.log(`Found ${snapshot.size} products`);

  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const updates = {};

    if (!Array.isArray(data.images) || data.images.length === 0) {
      if (data.image) {
        updates.images = [data.image];
      } else {
        updates.images = [];
      }
    }

    if (typeof data.showInCarousel === 'undefined') {
      updates.showInCarousel = Boolean(data.featured === true);
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await docSnap.ref.update(updates);
      updated++;
      console.log(`Updated ${docSnap.id}:`, updates);
    }
  }

  console.log(`Migration complete. Documents updated: ${updated}`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
