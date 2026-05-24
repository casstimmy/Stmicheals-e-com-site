import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

export default function ShippingPolicyPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  const sections = site.key === "hotel"
    ? [
        {
          heading: "Reservation response coverage",
          body: [
            "The hotel handles booking requests and table reservations directly through the reservations desk rather than through a shipping or delivery workflow.",
            "Response times may vary depending on room availability, lounge demand, and operating hours, especially where guest details need clarification before confirmation.",
          ],
        },
        {
          heading: "Guest coordination and confirmation",
          body: [
            "Reservation follow-up begins only after the request details have been received and reviewed. The hotel may contact the guest by email or phone to confirm availability, arrival timing, or lounge arrangements.",
            "Guests should monitor the contact details submitted with the reservation so follow-up and confirmation can be completed without delay.",
          ],
        },
        {
          heading: "Arrival and service issues",
          body: [
            "If submitted reservation details are incomplete, unreachable, or inaccurate, confirmation may be delayed until the guest provides the correct information.",
            "The hotel may contact the guest using the submitted details to resolve stay-date conflicts, arrival questions, seating limitations, or other service issues.",
          ],
        },
        {
          heading: "Changes before confirmation",
          body: [
            "Room rates, reservation timing, and lounge arrangements may change before final confirmation if availability, capacity, or guest requirements change.",
            "Guests should review the final reservation details shared by the hotel before relying on any unconfirmed booking request.",
          ],
        },
      ]
    : [
        {
          heading: "Delivery coverage",
          body: [
            "Delivery availability depends on the supported destinations configured in the inventory system. Delivery fees and eligible online campaign pricing are calculated from that inventory setup for each web order.",
            "Customers should choose the correct destination and provide a complete address so fulfilment can be coordinated accurately.",
          ],
        },
        {
          heading: "Order processing and confirmation",
          body: [
            "Fulfilment begins only after the order, stock reservation, and manual payment workflow have been reviewed by the team. Delivery timelines may vary based on destination, order volume, and operational demand.",
            "Customers should monitor their email and phone contact details for order acknowledgements, manual payment follow-up, or clarification requests related to fulfilment.",
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
            "Displayed delivery fees are part of the server-validated order total and may change if the cart contents, destination, or active online campaigns change before the order is submitted.",
            "Customers should review the final server-calculated total before placing the order for manual confirmation.",
          ],
        },
      ];
  return (
    <PolicyPageLayout
      title={site.key === "hotel" ? "Guest Service Policy" : "Shipping Policy"}
      intro={site.key === "hotel"
        ? `This policy outlines how reservation follow-up, guest coordination, and service confirmation work for requests placed through the ${site.shortLabel.toLowerCase()} side of the public site.`
        : `This policy outlines how delivery coverage, inventory-driven fees, and fulfilment coordination work for orders placed through the ${site.shortLabel.toLowerCase()} side of the public site.`}
      sections={sections}
    />
  );
}