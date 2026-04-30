import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

const sections = [
  {
    heading: "Information we collect",
    body: [
      "We collect the customer information required to process orders, support delivery, and respond to account or service requests. This can include name, email address, phone number, delivery address, city, and order history.",
      "We also process limited technical and session data needed to keep the storefront secure, maintain customer sessions, and diagnose service issues.",
    ],
  },
  {
    heading: "How we use your data",
    body: [
      "Customer data is used to create and manage orders, calculate delivery charges, verify account access with one-time passcodes, and communicate about payment or fulfillment status.",
      "We do not use your order data for unrelated purposes without a lawful basis, and we limit internal access to the information needed to operate the service.",
    ],
  },
  {
    heading: "Payments and communications",
    body: [
      "Payments are initiated through Paystack, and payment details are handled through that provider's secure payment flow rather than being stored directly in the storefront UI.",
      "Email communication may be used for account verification and order notifications. Customers should ensure their contact details remain accurate for service continuity.",
    ],
  },
  {
    heading: "Data access and contact",
    body: [
      "Customers may contact the store to correct profile information, request help with an order, or raise privacy-related concerns regarding their account or transaction records.",
      "Operational records may be retained for legitimate business, accounting, fraud prevention, and customer support needs.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      intro={`This policy explains how ${site.displayName} handles customer information used for orders, account access, delivery coordination, and payment-related communication.`}
      sections={sections}
    />
  );
}