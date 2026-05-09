import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { Storage } from '@google-cloud/storage';

const PORT = Number(process.env.PORT || 8787);
const BUCKET_NAME = process.env.GCS_BUCKET;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
const SIGNED_URL_TTL_MS = Number(process.env.GCS_SIGNED_URL_TTL_MS || 15 * 60 * 1000);
const PUBLIC_BASE_URL = process.env.GCS_PUBLIC_BASE_URL || '';

if (!BUCKET_NAME) {
  console.warn('GCS_BUCKET is not set. The signed upload server will not work until it is configured.');
}

const storage = new Storage();
const bucket = BUCKET_NAME ? storage.bucket(BUCKET_NAME) : null;

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

const sanitizeFileName = (filename) => {
  const baseName = String(filename || 'image').replace(/[^a-zA-Z0-9._-]+/g, '_');
  const extension = baseName.includes('.') ? `.${baseName.split('.').pop()}` : '';
  const nameWithoutExtension = baseName.includes('.') ? baseName.slice(0, baseName.lastIndexOf('.')) : baseName;
  return `${nameWithoutExtension || 'image'}_${randomUUID()}${extension || '.jpg'}`;
};

const makePublicUrl = (objectName) => {
  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL.replace(/\/$/, '')}/${encodeURIComponent(objectName)}`;
  }

  return `https://storage.googleapis.com/${BUCKET_NAME}/${encodeURIComponent(objectName)}`;
};

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
    sendJson(res, 200, { ok: true, bucket: BUCKET_NAME || null });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/gcs/upload-url') {
    if (!bucket) {
      sendJson(res, 500, { error: 'GCS bucket is not configured. Set GCS_BUCKET first.' });
      return;
    }

    try {
      const { filename, contentType } = await readBody(req);
      const objectName = `products/${Date.now()}_${sanitizeFileName(filename)}`;
      const file = bucket.file(objectName);

      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + SIGNED_URL_TTL_MS,
        contentType: contentType || 'application/octet-stream'
      });

      sendJson(res, 200, {
        objectName,
        uploadUrl,
        publicUrl: makePublicUrl(objectName)
      });
    } catch (error) {
      sendJson(res, 500, {
        error: error?.message || 'Failed to create a signed upload URL.'
      });
    }
    return;
  }

  // Proxy upload endpoint: accepts JSON { filename, contentType, base64 }
  // Use this when client cannot PUT directly to GCS due to CORS restrictions.
  if (req.method === 'POST' && req.url === '/api/gcs/proxy-upload') {
    if (!bucket) {
      sendJson(res, 500, { error: 'GCS bucket is not configured. Set GCS_BUCKET first.' });
      return;
    }

    try {
      const { filename, contentType, base64 } = await readBody(req);
      if (!base64) {
        sendJson(res, 400, { error: 'Missing base64 file data.' });
        return;
      }

      const objectName = `products/${Date.now()}_${sanitizeFileName(filename)}`;
      const file = bucket.file(objectName);

      const buffer = Buffer.from(base64, 'base64');

      await file.save(buffer, {
        metadata: { contentType: contentType || 'application/octet-stream' }
      });

      // Make object public if the bucket is not configured for public access
      try {
        await file.makePublic();
      } catch {
        // ignore if makePublic is not permitted; object may already be accessible via signed URL
      }

      sendJson(res, 200, {
        objectName,
        publicUrl: makePublicUrl(objectName)
      });
    } catch (error) {
      sendJson(res, 500, { error: error?.message || 'Proxy upload failed.' });
    }

    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`GCS upload server listening on http://localhost:${PORT}`);
});
