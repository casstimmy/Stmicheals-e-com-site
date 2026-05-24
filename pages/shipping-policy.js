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
  return (
    <PolicyPageLayout
      title={site.key === "hotel" ? "Guest Service Policy" : "Shipping Policy"}
      intro={site.key === "hotel"
        ? `This policy outlines how reservation follow-up, guest coordination, and service confirmation work for requests placed through the ${site.shortLabel.toLowerCase()} side of the public site.`
        : `This policy outlines how delivery coverage, shipping charges, and fulfillment coordination work for orders placed through the ${site.shortLabel.toLowerCase()} side of the public site.`}
      sections={sections}
    />
  );
}