import PolicyPageLayout from "@/components/PolicyPageLayout";

const sections = [
  {
    heading: "General returns position",
    body: [
      "Customers should inspect delivered items promptly and contact the store as soon as possible if an order is incorrect, damaged, incomplete, or materially inconsistent with what was purchased.",
      "Because the store handles food, drinks, and essential goods, return eligibility may depend on product condition, product type, and whether the item is safe and suitable for resale or replacement handling.",
    ],
  },
  {
    heading: "Damaged, missing, or incorrect orders",
    body: [
      "Where a verified delivery issue exists, the store may review the order and determine an appropriate remedy such as replacement, partial adjustment, or refund handling, depending on the circumstances.",
      "Customers may be asked to provide order details, photos, or a short description of the issue to support review.",
    ],
  },
  {
    heading: "Non-returnable situations",
    body: [
      "Items that have been consumed, opened, tampered with, improperly stored after delivery, or reported too late to verify safely may not qualify for return or refund handling.",
      "The store may decline return requests where the product condition or the facts available do not support a responsible resolution.",
    ],
  },
  {
    heading: "Refund timing",
    body: [
      "Approved refund outcomes may depend on the original payment method and the relevant payment provider's processing timeline.",
      "Customers should contact the store if an expected resolution or refund update has not been received within a reasonable operational period.",
    ],
  },
];

export default function ReturnsAndRefundsPage() {
  return (
    <PolicyPageLayout
      title="Returns & Refunds"
      intro="This policy explains how St Michael's Store reviews issues with delivered goods and how return or refund requests are handled where appropriate."
      sections={sections}
    />
  );
}