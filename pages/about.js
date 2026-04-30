import PolicyPageLayout from "@/components/PolicyPageLayout";

const sections = [
  {
    heading: "What the store is built for",
    body: [
      "St Michael's Food & Drinks Warehouse is structured to help customers move from discovery to checkout with clearer product visibility, stock-aware ordering, and dependable payment initiation.",
      "The storefront focuses on practical essentials, organized browsing, and a cleaner customer journey for repeat grocery and household purchasing.",
    ],
  },
  {
    heading: "How the storefront operates",
    body: [
      "Products, inventory, shipping totals, and payment steps are validated by the server so the customer sees a more consistent ordering experience from cart to confirmation.",
      "Account access is handled through email one-time passcodes, helping customers review activity and continue their shopping flow without a traditional password setup.",
    ],
  },
  {
    heading: "Customer service focus",
    body: [
      "The store aims to keep ordering clear, mobile-friendly, and easy to recover when customers need help with delivery details, account access, or payment confirmation.",
      "Policy pages, contact routes, and footer navigation are provided so important information stays accessible across storefront pages, not hidden behind checkout steps.",
    ],
  },
];

export default function AboutPage() {
  return (
    <PolicyPageLayout
      title="About Us"
      intro="Learn how St Michael's Food & Drinks Warehouse approaches catalog browsing, secure checkout, and customer support for everyday grocery and household orders."
      sections={sections}
      eyebrow="About the store"
      backHref="/products"
      backLabel="Browse products"
      supportHref="/contact"
      supportLabel="Contact the store"
      relatedTitle="Store pages"
    />
  );
}