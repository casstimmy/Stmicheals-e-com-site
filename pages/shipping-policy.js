import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

const sections = [
  {
    heading: "Delivery coverage",
    body: [
      "Shipping availability depends on the supported delivery destinations configured by the store. Delivery charges are quoted based on the selected city and may fall back to a standard rate when live quotes are unavailable.",
      "Customers should choose the correct destination and provide a complete address so delivery can be coordinated accurately.",
    ],
  },
  {
    heading: "Order processing and confirmation",
    body: [
      "Shipping begins only after the order, stock reservation, and payment flow have been validated. Delivery timelines may vary based on destination, order volume, and operational demand.",
      "Customers should monitor their email and phone contact details for updates or clarification requests related to fulfillment.",
    ],
  },
  {
    heading: "Delivery issues",
    body: [
      "If delivery details are incomplete, unreachable, or inaccurate, fulfillment may be delayed until the customer confirms the correct information.",
      "The store may contact the customer using the submitted order details to resolve delivery challenges, access limitations, or destination-specific issues.",
    ],
  },
  {
    heading: "Fees and changes",
    body: [
      "Displayed shipping fees are part of the server-validated order total and may be updated if the delivery destination changes before payment is initiated.",
      "Customers should review the final quoted total before completing payment authorization.",
    ],
  },
];

export default function ShippingPolicyPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  return (
    <PolicyPageLayout
      title="Shipping Policy"
      intro={`This policy outlines how delivery coverage, shipping charges, and fulfillment coordination work for orders placed through the ${site.shortLabel.toLowerCase()} side of the public site.`}
      sections={sections}
    />
  );
}