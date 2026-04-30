import PolicyPageLayout from "@/components/PolicyPageLayout";
import { STORE_DETAILS } from "@/lib/storeDetails";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

export default function ContactPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  const sections = [
    {
      heading: `How to reach the ${site.shortLabel.toLowerCase()} desk`,
      body: [
        `Customers can contact the business by email at ${STORE_DETAILS.email} or by phone using ${STORE_DETAILS.phoneNumbers.join(" or ")} for general inquiries, order follow-up, and service questions.`,
        "For faster support, use the same email address connected to the order or account you are asking about.",
      ],
    },
    {
      heading: "Helpful details to include",
      body: [
        "When following up on an order, include your order reference, delivery city, and a short summary of the issue so the team can review the request quickly.",
        "For account-access questions, mention whether the issue relates to OTP delivery, session access, or profile information so support can respond with the right next step.",
      ],
    },
    {
      heading: "Business and delivery context",
      body: [
        `The business operates in ${STORE_DETAILS.country}, and the registered location code is ${STORE_DETAILS.locationCode}.`,
        `Delivery coordination, ${site.shortLabel.toLowerCase()} totals, and payment confirmation may require follow-up communication when order details need clarification.`,
      ],
    },
  ];

  return (
    <PolicyPageLayout
      title="Contact Us"
      intro={`Reach the ${site.shortLabel.toLowerCase()} side for help with orders, delivery questions, account verification, or general business inquiries.`}
      sections={sections}
      eyebrow="Customer support"
      supportHref="/about"
      supportLabel={`About the ${site.shortLabel.toLowerCase()} side`}
      relatedTitle="Support pages"
    />
  );
}