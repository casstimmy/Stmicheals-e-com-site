export const STORE_DETAILS = {
  displayName: "St Michael's Store",
  businessName: "St's Michael's Food & Drinks Warehouse Ltd",
  phoneNumbers: ["08020972172", "07062625295"],
  country: "Nigeria",
  email: "info@saintmichaelsplace.com",
  locationCode: "106104",
};

export const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-and-refunds", label: "Returns & Refunds" },
];

export const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export const PRIMARY_FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "Account" },
];

export const RESOURCE_LINKS = [...COMPANY_LINKS, ...POLICY_LINKS];