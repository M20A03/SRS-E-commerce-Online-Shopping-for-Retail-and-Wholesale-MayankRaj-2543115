/**
 * Enterprise Router Guards & Middleware Engine
 * Handles:
 * 1. Geo-routing & Delivery Zone Validation (Local Dhanbad vs Regional Jharkhand vs National)
 * 2. Bot & Crawler Detection for SEO optimization
 * 3. Auth & Role Gatekeeping
 * 4. A/B Testing Variant Assignment
 */

// Dhanbad postal code prefix pattern (826xxx)
const DHANBAD_PIN_REGEX = /^826\d{3}$/;
const JHARKHAND_PIN_REGEX = /^8[123]\d{4}$/;

// Known search engine crawler user agents
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'ia_archiver',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'slackbot',
  'vkshare',
  'w3c_validator'
];

/**
 * Detects if the current visitor is an automated web crawler or search bot
 */
export function isSearchEngineBot(userAgent = '') {
  const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

/**
 * Evaluates delivery eligibility & calculates estimated delivery speed based on PIN code
 * @param {string} pincode - 6 digit Indian postal PIN code
 */
export function evaluateDeliveryZone(pincode = '') {
  const cleanPin = String(pincode).trim();
  if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return {
      valid: false,
      zone: 'unknown',
      label: 'Invalid PIN Code',
      deliveryTime: 'Standard',
      expressAvailable: false,
      shippingDiscount: false,
    };
  }

  if (DHANBAD_PIN_REGEX.test(cleanPin)) {
    return {
      valid: true,
      zone: 'dhanbad-local',
      label: 'Dhanbad Local Zone (Fastest)',
      deliveryTime: 'Same-Day / Next-Day Delivery',
      expressAvailable: true,
      shippingDiscount: true,
      freeDeliveryThreshold: 499,
    };
  }

  if (JHARKHAND_PIN_REGEX.test(cleanPin)) {
    return {
      valid: true,
      zone: 'jharkhand-regional',
      label: 'Jharkhand State Zone',
      deliveryTime: '1 - 2 Business Days',
      expressAvailable: false,
      shippingDiscount: false,
      freeDeliveryThreshold: 999,
    };
  }

  return {
    valid: true,
    zone: 'national',
    label: 'All India Zone',
    deliveryTime: '3 - 5 Business Days',
    expressAvailable: false,
    shippingDiscount: false,
    freeDeliveryThreshold: 1499,
  };
}

/**
 * A/B Testing Variant Resolver
 * Deterministically assigns a user or session to an A/B experiment variant ('control' vs 'treatment')
 */
export function getExperimentVariant(experimentKey, userIdOrSessionId) {
  try {
    const storageKey = `ab_${experimentKey}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) return saved;

    const seed = userIdOrSessionId || Math.random().toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const variant = Math.abs(hash) % 2 === 0 ? 'control' : 'treatment';
    localStorage.setItem(storageKey, variant);
    return variant;
  } catch {
    return 'control';
  }
}

/**
 * Route Authentication Gatekeeper
 */
export function checkAuthAccess({ user, loading, requiredRole = 'user' }) {
  if (loading) {
    return { allowed: false, pending: true, redirect: null };
  }

  if (!user) {
    return { allowed: false, pending: false, redirect: '/account' };
  }

  if (requiredRole === 'admin' && !user.isAdmin) {
    return { allowed: false, pending: false, redirect: '/' };
  }

  return { allowed: true, pending: false, redirect: null };
}
