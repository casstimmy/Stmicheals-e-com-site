import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

export default function AboutPage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  const isHotelSite = site.key === "hotel";
  const sections = isHotelSite
    ? [
        {
          heading: "What the hotel side is built for",
          body: [
            `${site.displayName} is designed as a direct hospitality experience where guests can browse rooms, review lounge offerings, and send reservation requests without going through an ecommerce checkout flow.`,
            "This side focuses on guest comfort, calmer browsing, and direct communication with the reservations desk for room stays, lounge visits, and booking follow-up.",
          ],
        },
        {
          heading: "How reservations are handled",
          body: [
            "Room requests and table reservations are submitted directly to the hotel team, who then confirm availability, timing, and any guest-specific notes before finalizing arrangements.",
            "Reservation confirmations, management links, and follow-up communication are kept tied to the guest email used during submission so the hotel can respond with the right context.",
          ],
        },
        {
          heading: "Guest service focus",
          body: [
            "The hotel side is built to keep room selection, reservation lookups, and support information clear on mobile and desktop without pushing guests through stock, cart, or warehouse-style interactions.",
            "Contact routes, booking management pages, and hotel policy pages stay visible throughout the public site so guests can quickly find help before or after they submit a request.",
          ],
        },
      ]
    : [
        {
          heading: `What the ${site.shortLabel.toLowerCase()} side is built for`,
          body: [
            `${site.displayName} is structured to help customers move from discovery to checkout with clearer product visibility, stock-aware ordering, and dependable payment initiation.`,
            "This public side focuses on practical essentials, organized browsing, and a cleaner customer journey for repeat grocery and household purchasing.",
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
      intro={isHotelSite
        ? `Learn how ${site.displayName} approaches direct reservations, guest communication, and lounge service on the hotel side of St Michael's.`
        : `Learn how ${site.displayName} approaches catalog browsing, secure checkout, and customer support for this side of the business.`}
      sections={sections}
      eyebrow={`About the ${site.shortLabel.toLowerCase()} side`}
      backHref={isHotelSite ? "/rooms" : "/products"}
      backLabel={isHotelSite ? "Browse rooms" : "Browse products"}
      supportHref="/contact"
      supportLabel={isHotelSite ? "Contact reservations" : `Contact the ${site.shortLabel.toLowerCase()} desk`}
      relatedTitle={`${site.shortLabel} pages`}
    />
  );
}