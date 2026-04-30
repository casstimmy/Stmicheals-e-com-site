import PolicyPageLayout from "@/components/PolicyPageLayout";
import { STORE_DETAILS } from "@/lib/storeDetails";

const sections = [
  {
    heading: "How to reach the store",
    body: [
      `Customers can contact the store by email at ${STORE_DETAILS.email} or by phone using ${STORE_DETAILS.phoneNumbers.join(" or ")} for general inquiries, order follow-up, and service questions.`,
      "For faster support, use the same email address connected to the order or account you are asking about.",
    ],
  },
  {
    heading: "Helpful details to include",
    body: [
      "When following up on an order, include your order reference, delivery city, and a short summary of the issue so the store can review the request quickly.",
      "For account-access questions, mention whether the issue relates to OTP delivery, session access, or profile information so support can respond with the right next step.",
    ],
  },
  {
    heading: "Business and delivery context",
    body: [
      `The store operates in ${STORE_DETAILS.country}, and the business record uses location code ${STORE_DETAILS.locationCode}.`,
      "Delivery coordination, shipping totals, and payment confirmation may require follow-up communication when order details need clarification.",
    ],
  },
];

export default function ContactPage() {
  return (
    <PolicyPageLayout
      title="Contact Us"
      intro="Reach the store for help with orders, delivery questions, account verification, or general business inquiries."
      sections={sections}
      eyebrow="Customer support"
      supportHref="/about"
      supportLabel="About the store"
      relatedTitle="Support pages"
    />
  );
}