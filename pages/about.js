import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

export default function AboutPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  const sections = [
    {
      heading: `What the ${site.shortLabel.toLowerCase()} side is built for`,
      body: [
        `${site.displayName} is structured to help customers move from discovery to checkout with clearer product visibility, stock-aware ordering, and dependable payment initiation.`,
        `This public side focuses on ${site.shortLabel === "Hotel" ? "hospitality-ready products, guest support items, and operational clarity for hotel use" : "practical essentials, organized browsing, and a cleaner customer journey for repeat grocery and household purchasing"}.`,
      ],
    },
    {
      heading: `How the ${site.shortLabel.toLowerCase()} catalog operates`,
      body: [
        "Products, inventory, shipping totals, and payment steps are validated by the server so the customer sees a more consistent ordering experience from cart to confirmation.",
        "Account access is handled through email one-time passcodes, helping customers review activity and continue their shopping flow without a traditional password setup.",
      ],
    },
    {
      heading: "Customer service focus",
      body: [
        `The ${site.shortLabel.toLowerCase()} side is designed to keep ordering clear, mobile-friendly, and easy to recover when customers need help with delivery details, account access, or payment confirmation.`,
        "Policy pages, contact routes, and footer navigation are provided so important information stays accessible across the public site, not hidden behind checkout steps.",
      ],
    },
  ];

  return (
    <PolicyPageLayout
      title="About Us"
      intro={`Learn how ${site.displayName} approaches catalog browsing, secure checkout, and customer support for this side of the business.`}
      sections={sections}
      eyebrow={`About the ${site.shortLabel.toLowerCase()} side`}
      backHref="/products"
      backLabel="Browse products"
      supportHref="/contact"
      supportLabel={`Contact the ${site.shortLabel.toLowerCase()} desk`}
      relatedTitle={`${site.shortLabel} pages`}
    />
  );
}