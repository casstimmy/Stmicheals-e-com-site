import PolicyPageLayout from "@/components/PolicyPageLayout";
import { useRouter } from "next/router";
import { getPublicSiteConfig, inferPublicSiteFromPath, normalizePublicSite } from "@/lib/publicSite";

export default function TermsOfServicePage() {
  const router = useRouter();
  const site = getPublicSiteConfig(normalizePublicSite(inferPublicSiteFromPath(router.pathname)));
  const sections = site.key === "hotel"
    ? [
        {
          heading: "Use of the hotel site",
          body: [
            "By submitting a room or table request through the hotel site, guests agree to provide accurate contact details, stay information, and reservation notes needed for review and confirmation.",
            "The hotel may restrict, suspend, or reject activity that appears fraudulent, abusive, technically harmful, or inconsistent with lawful use of the service.",
          ],
        },
        {
          heading: "Availability and reservation status",
          body: [
            "Room listings, rates, and lounge availability are presented in good faith, but a booking request is not final until the hotel confirms availability and accepts the reservation.",
            "If availability changes, operational interruptions occur, or submitted details require clarification, the hotel may pause or decline a request until it can be reviewed properly.",
          ],
        },
        {
          heading: "Guest communications and access",
          body: [
            "Reservation confirmations and management links are sent to the guest email submitted with the request. Guests are responsible for controlling access to that email address.",
            "The hotel may reject or invalidate reservation access activity that appears expired, abusive, or inconsistent with expected verification controls.",
          ],
        },
        {
          heading: "Service limitations",
          body: [
            "The hotel site is provided on a commercially reasonable basis. Temporary service interruptions, third-party provider issues, and network failures may affect access to public pages or reservation submissions.",
            "Submitting a request does not by itself guarantee a room, table, or rate until the reservation desk confirms the arrangement directly.",
          ],
        },
      ]
    : [
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
  return (
    <PolicyPageLayout
      title={site.key === "hotel" ? "Guest Terms of Service" : "Terms of Service"}
      intro={site.key === "hotel"
        ? `These terms describe the rules governing use of the ${site.shortLabel.toLowerCase()} public site, reservation requests, guest communications, and booking confirmation through ${site.displayName}.`
        : `These terms describe the basic rules governing use of the ${site.shortLabel.toLowerCase()} public site, customer accounts, ordering, and payment initiation through ${site.displayName}.`}
      sections={sections}
    />
  );
}