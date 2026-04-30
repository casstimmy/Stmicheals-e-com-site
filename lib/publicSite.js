export const PUBLIC_SITE_KEYS = {
  STORE: "store",
  HOTEL: "hotel",
};

const SITE_LOCATION_TOKENS = {
  [PUBLIC_SITE_KEYS.STORE]: ["warehouse", "store"],
  [PUBLIC_SITE_KEYS.HOTEL]: ["hotel"],
};

export const PUBLIC_SITE_CONFIGS = {
  [PUBLIC_SITE_KEYS.STORE]: {
    key: PUBLIC_SITE_KEYS.STORE,
    label: "Store",
    shortLabel: "Store",
    displayName: "St Michael's Food & Drinks Warehouse",
    tagLine: "Essentials marketplace",
    topBarCopy: "Trusted warehouse ordering across major Nigerian cities",
    topBarCta: "Explore store catalog",
    heroEyebrow: "Curated warehouse feature",
    heroTitle: "Fresh essentials, refined service, fewer checkout frictions.",
    heroDescription:
      "Shop groceries, pantry staples, beverages, and everyday essentials with clearer discovery, safer payment handling, and reliable stock visibility.",
    heroHighlights: [
      "Server-verified checkout",
      "Fresh curated inventory",
    ],
    featuredProductLabel: "Featured store product",
    secondaryCtaLabel: "Browse Store Categories",
    listingEyebrow: "Complete store catalog",
    listingTitle: "Store Products",
    listingDescription:
      "Filter warehouse products by category, search by keyword, and move through the catalog with URL-backed filters.",
    categoryEyebrow: "Guided store browsing",
    categoryTitle: "Shop Store Categories",
    categoryDescription:
      "Browse warehouse categories, narrow results with live search, and open a filtered store catalog view.",
    emptyCatalogMessage: "No warehouse products are published yet.",
  },
  [PUBLIC_SITE_KEYS.HOTEL]: {
    key: PUBLIC_SITE_KEYS.HOTEL,
    label: "Hotel",
    shortLabel: "Hotel",
    displayName: "St Michael's Hotel",
    tagLine: "Hospitality service catalog",
    topBarCopy: "Guest-ready hotel supply and service selections",
    topBarCta: "Explore hotel catalog",
    heroEyebrow: "Curated hotel feature",
    heroTitle: "Hotel-ready essentials, guest comfort, cleaner service coordination.",
    heroDescription:
      "Browse hospitality products prepared for guest service, breakfast operations, room support, and front-of-house coordination with stock-aware visibility.",
    heroHighlights: [
      "Guest-service ready catalog",
      "Hospitality stock visibility",
    ],
    featuredProductLabel: "Featured hotel product",
    secondaryCtaLabel: "Browse Hotel Categories",
    listingEyebrow: "Complete hotel catalog",
    listingTitle: "Hotel Products",
    listingDescription:
      "Filter hotel-ready products by category, search guest-service items, and move through the hospitality catalog with URL-backed filters.",
    categoryEyebrow: "Guided hotel browsing",
    categoryTitle: "Browse Hotel Categories",
    categoryDescription:
      "Explore hotel-facing categories, search inside them, and open a filtered hotel catalog view for hospitality operations.",
    emptyCatalogMessage: "No hotel products are published yet.",
  },
};

function normalizeTextToken(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
}

export function normalizePublicSite(siteKey) {
  return siteKey === PUBLIC_SITE_KEYS.HOTEL ? PUBLIC_SITE_KEYS.HOTEL : PUBLIC_SITE_KEYS.STORE;
}

export function getPublicSiteConfig(siteKey) {
  return PUBLIC_SITE_CONFIGS[normalizePublicSite(siteKey)];
}

export function inferPublicSiteFromPath(pathname = "") {
  if (typeof pathname !== "string") {
    return null;
  }

  if (pathname === "/hotel" || pathname.startsWith("/hotel/")) {
    return PUBLIC_SITE_KEYS.HOTEL;
  }

  if (pathname === "/store" || pathname.startsWith("/store/")) {
    return PUBLIC_SITE_KEYS.STORE;
  }

  return null;
}

export function getPublicSiteBasePath(siteKey) {
  return `/${normalizePublicSite(siteKey)}`;
}

export function getPublicSitePath(siteKey, suffix = "") {
  const basePath = getPublicSiteBasePath(siteKey);

  if (!suffix || suffix === "/") {
    return basePath;
  }

  return `${basePath}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

export function getPublicScopedHref(siteKey, href = "/") {
  if (typeof href !== "string" || !href) {
    return getPublicSitePath(siteKey);
  }

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("/api/") ||
    href === "/store" ||
    href === "/hotel" ||
    href.startsWith("/store/") ||
    href.startsWith("/hotel/")
  ) {
    return href;
  }

  if (href === "/") {
    return getPublicSitePath(siteKey);
  }

  return getPublicSitePath(siteKey, href);
}

export function getPublicProductPath(siteKey, productId) {
  return getPublicSitePath(siteKey, `/product/${productId}`);
}

export function getPublicOrderConfirmationPath(siteKey, orderId) {
  return getPublicSitePath(siteKey, `/checkout/order-confirmation/${orderId}`);
}

export function getNormalizedProductLocations(product) {
  return (Array.isArray(product?.locations) ? product.locations : [])
    .map(normalizeTextToken)
    .filter(Boolean);
}

export function productMatchesPublicSite(product, siteKey) {
  if (!siteKey) {
    return true;
  }

  const normalizedSite = normalizePublicSite(siteKey);
  const locations = getNormalizedProductLocations(product);
  const acceptedTokens = SITE_LOCATION_TOKENS[normalizedSite] || [];

  if (!locations.length || !acceptedTokens.length) {
    return false;
  }

  return locations.some((location) =>
    acceptedTokens.some((acceptedToken) => location.includes(acceptedToken))
  );
}

export function filterProductsForPublicSite(products = [], siteKey) {
  if (!siteKey) {
    return [...products];
  }

  return products.filter((product) => productMatchesPublicSite(product, siteKey));
}