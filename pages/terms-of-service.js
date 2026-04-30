import PolicyPageLayout from "@/components/PolicyPageLayout";

const sections = [
  {
    heading: "Storefront use",
    body: [
      "By placing orders through this storefront, customers agree to provide accurate details for fulfillment, payment verification, and customer communication.",
      "The store may restrict, suspend, or cancel activity that appears fraudulent, abusive, technically harmful, or inconsistent with lawful use of the service.",
    ],
  },
  {
    heading: "Catalog accuracy and availability",
    body: [
      "Product listings, prices, and availability are presented in good faith, but inventory and pricing are revalidated by the server before payment begins.",
      "If stock changes, pricing errors, or service interruptions affect an order, the store may pause or reject checkout until the order can be confirmed correctly.",
    ],
  },
  {
    heading: "Accounts and verification",
    body: [
      "Customer account access uses email one-time passcodes. Customers are responsible for controlling access to the email address used for sign-in and checkout.",
      "The store may reject OTP or session activity that appears invalid, expired, abusive, or inconsistent with expected verification controls.",
    ],
  },
  {
    heading: "Orders, payments, and service limitations",
    body: [
      "Orders are not treated as fully completed until payment, inventory reservation, and relevant server-side checks succeed. A payment attempt alone does not guarantee final acceptance if validation fails.",
      "The storefront is provided on a commercially reasonable basis. Temporary service interruptions, third-party provider issues, and network failures may affect access to the service.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <PolicyPageLayout
      title="Terms of Service"
      intro="These terms describe the basic rules governing use of the storefront, customer accounts, ordering, and payment initiation through St Michael's Store."
      sections={sections}
    />
  );
}