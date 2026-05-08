import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Center from "@/components/Center";
import Header from "@/components/Header";
import HotelBookingForm from "@/components/HotelBookingForm";
import HotelRoomCard from "@/components/HotelRoomCard";
import {
  getHotelRoomAmenities,
  getHotelRoomBedLabel,
  getHotelRoomOccupancy,
  getHotelRoomRateLabel,
  getHotelPropertyValue,
} from "@/lib/hotelCatalog";
import { getPrimaryProductImage, normalizeProductImages, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImages";
import { PUBLIC_SITE_KEYS, getPublicSiteConfig, getPublicSitePath } from "@/lib/publicSite";
import { getReviewSummary } from "@/lib/reviews";
import { resolveHotelCatalogSections, resolveHotelRoomById } from "@/lib/hotelStorefront";
import { isHotelRoomProduct } from "@/lib/hotelCatalog";
import { getStorefrontProductById, getStorefrontProducts } from "@/lib/storefrontCatalog";

const hotelDateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatHotelDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return hotelDateFormatter.format(date);
}

function getHotelRoomDescription(room) {
  const description = room?.description?.trim() || "";
  const roomName = room?.name?.trim() || "";

  if (description && description.toLowerCase() !== roomName.toLowerCase()) {
    return description;
  }

  const categoryLabel = room?.categoryName || room?.category || "room";

  return `${roomName || "This room"} is part of the ${categoryLabel.toLowerCase()} collection with direct reservation support, guest-arrival coordination, and hotel-desk confirmation before your stay is finalized.`;
}

export default function HotelRoomDetailPage({ site, room, relatedRooms }) {
  const galleryImages = normalizeProductImages(room.images);
  const amenities = getHotelRoomAmenities(room);
  const reviews = Array.isArray(room.reviews) ? room.reviews : [];
  const reviewSummary = getReviewSummary(reviews);
  const resolvedDescription = getHotelRoomDescription(room);
  const roomReference = room.sku || room.barcode || String(room._id);
  const locationLabel = Array.isArray(room.locations) && room.locations.length ? room.locations.join(", ") : "Hotel";
  const publishedOn = formatHotelDate(room.createdAt);
  const updatedOn = formatHotelDate(room.updatedAt);
  const roomProperties = Array.isArray(room.properties)
    ? room.properties.filter((property) => property?.label && property?.value)
    : [];
  const floorArea = getHotelPropertyValue(room, ["Floor area", "Room size", "Size"]);
  const viewType = getHotelPropertyValue(room, ["View", "Room view", "Facing"]);
  const stayStyle = getHotelPropertyValue(room, ["Stay style", "Experience", "Use case"]);
  const checkInNote = getHotelPropertyValue(room, ["Check-in note", "Arrival", "Access"]);
  const comfortHighlights = [floorArea, viewType, stayStyle, checkInNote].filter(Boolean);
  const detailStats = [
    {
      label: "Nightly rate",
      value: getHotelRoomRateLabel(room),
      meta: "published starting rate",
    },
    {
      label: "Room code",
      value: roomReference,
      meta: "share this with reservations",
    },
    {
      label: "Guest rating",
      value: reviewSummary.count ? `${reviewSummary.averageLabel} / 5` : "New listing",
      meta: reviewSummary.count
        ? `${reviewSummary.count} guest review${reviewSummary.count === 1 ? "" : "s"}`
        : "first guest feedback pending",
    },
    {
      label: "Published",
      value: publishedOn || "Recently added",
      meta: updatedOn ? `updated ${updatedOn}` : `served from ${locationLabel}`,
    },
  ];
  const roomProfileRows = roomProperties.length > 0
    ? roomProperties
    : [
        { label: "Reservation flow", value: "Direct request with hotel-desk confirmation" },
        { label: "Arrival coordination", value: "Share preferred arrival time in your booking request" },
        { label: "Guest support", value: "Availability is confirmed manually before your stay is locked in" },
        { label: "Location", value: locationLabel },
      ];

  return (
    <>
      <Head>
        <title>{`${room.name} | ${site.displayName}`}</title>
      </Head>
      <Header siteKey={site.key} />
      <Center>
        <div className="hotel-page min-h-screen px-4 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="hotel-shell rounded-[2rem] p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap gap-3">
                <span className="hotel-shell-kicker inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  {room.categoryName || room.category || "Room"}
                </span>
                <span className="hotel-rate-pill rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm">
                  {getHotelRoomRateLabel(room)}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-[#fff1dc] sm:text-4xl">{room.name}</h1>
              <p className="hotel-shell-muted mt-4 text-base leading-8">{resolvedDescription}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/booking")} className="hotel-button-primary inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                  Request this stay
                </Link>
                <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/rooms")} className="hotel-button-secondary inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                  Back to rooms
                </Link>
              </div>

              <div className="mt-6 relative overflow-hidden rounded-[1.6rem] bg-[rgba(255,250,243,0.08)]">
                <Image
                  src={getPrimaryProductImage(room.images) || PRODUCT_IMAGE_PLACEHOLDER}
                  alt={room.name}
                  width={1200}
                  height={760}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="h-auto w-full object-cover"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(galleryImages.length ? galleryImages : [{ full: PRODUCT_IMAGE_PLACEHOLDER, thumb: PRODUCT_IMAGE_PLACEHOLDER }]).slice(0, 3).map((image, index) => (
                  <div key={`${image.thumb}-${index}`} className="relative h-28 overflow-hidden rounded-[1.2rem] bg-[rgba(255,250,243,0.08)] sm:h-36">
                    <Image
                      src={image.thumb}
                      alt={`${room.name} gallery ${index + 1}`}
                      fill
                      loading={index === 0 ? "eager" : undefined}
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="hotel-shell-card rounded-[1.35rem] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">Occupancy</p>
                  <p className="mt-2 text-lg font-bold text-[#fff1dc]">{getHotelRoomOccupancy(room)}</p>
                </div>
                <div className="hotel-shell-card rounded-[1.35rem] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">Bed setup</p>
                  <p className="mt-2 text-lg font-bold text-[#fff1dc]">{getHotelRoomBedLabel(room)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {detailStats.map((stat) => (
                  <div key={stat.label} className="hotel-shell-card rounded-[1.35rem] px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">{stat.label}</p>
                    <p className="mt-2 text-base font-bold text-[#fff1dc]">{stat.value}</p>
                    <p className="mt-1 text-sm text-[rgba(245,238,226,0.72)]">{stat.meta}</p>
                  </div>
                ))}
              </div>

              <div className="hotel-shell-card mt-6 rounded-[1.5rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">Room profile</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {comfortHighlights.length > 0 ? (
                    comfortHighlights.map((detail) => (
                      <div key={detail} className="rounded-[1.1rem] bg-[rgba(255,250,243,0.1)] px-4 py-3 text-sm font-semibold text-[#f6d48a]">
                        {detail}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[rgba(245,238,226,0.72)]">Detailed room notes will appear here when the catalog includes them.</p>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {roomProfileRows.map((property) => (
                    <div key={`${property.label}-${property.value}`} className="rounded-[1.1rem] bg-[rgba(255,250,243,0.08)] px-4 py-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(245,238,226,0.56)]">
                        {property.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#fff1dc]">{property.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hotel-shell-card mt-6 rounded-[1.5rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">Included comforts</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-[rgba(255,250,243,0.1)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f6d48a]">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hotel-shell-card mt-6 rounded-[1.5rem] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[rgba(245,238,226,0.56)]">Guest feedback</p>
                  <span className="rounded-full bg-[rgba(255,250,243,0.1)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f6d48a]">
                    {reviewSummary.count ? `${reviewSummary.averageLabel} / 5 from ${reviewSummary.count}` : "New listing"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 2).map((review, index) => (
                      <div key={`${review.title || review.customerName || "review"}-${index}`} className="rounded-[1.1rem] bg-[rgba(255,250,243,0.08)] px-4 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[#fff1dc]">{review.title || "Guest review"}</p>
                            <p className="mt-1 text-sm text-[rgba(245,238,226,0.72)]">
                              {[review.customerName || "Guest", formatHotelDate(review.createdAt)].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                          <span className="rounded-full bg-[rgba(255,250,243,0.1)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f6d48a]">
                            {review.rating ? `${review.rating} / 5` : "Verified stay"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[rgba(245,238,226,0.82)]">{review.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-[rgba(245,238,226,0.72)]">
                      This room is available for direct enquiries now. Guest feedback will appear here once published stays start receiving reviews.
                    </p>
                  )}
                </div>
              </div>


              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/lounge")} className="hotel-button-primary inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                  Explore lounge menu
                </Link>
                <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/booking")} className="hotel-button-secondary inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                  Request availability
                </Link>
              </div>

            </section>

            <HotelBookingForm
              rooms={[room]}
              selectedRoomId={String(room._id)}
              title="Request this room"
              intro="Choose your dates and guest details. The hotel desk will confirm availability and follow up directly with you."
              submitLabel="Request this room"
              compact
            />
          </div>

          {relatedRooms.length > 0 ? (
            <section className="hotel-section mt-8 rounded-[2rem] p-6 md:p-8">
              <div className="hotel-divider mb-6 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="hotel-kicker inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                    Similar stays
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)]">Compare other room types</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {relatedRooms.map((relatedRoom) => (
                  <HotelRoomCard key={relatedRoom._id} room={relatedRoom} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Center>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { id } = context.query;
    const siteKey = PUBLIC_SITE_KEYS.HOTEL;
    const [roomProduct, products] = await Promise.all([
      getStorefrontProductById(id, { site: siteKey }),
      getStorefrontProducts({ site: siteKey }),
    ]);
    const room = roomProduct || resolveHotelRoomById(id);

    if (!room || !isHotelRoomProduct(room)) {
      return { notFound: true };
    }

    const sections = resolveHotelCatalogSections(products);
    const relatedRooms = sections.rooms.filter((candidate) => String(candidate._id) !== String(room._id)).slice(0, 3);

    return {
      props: {
        site: getPublicSiteConfig(siteKey),
        room: JSON.parse(JSON.stringify(room)),
        relatedRooms: JSON.parse(JSON.stringify(relatedRooms)),
      },
    };
  } catch (error) {
    console.error("Hotel room detail SSR error:", error);
    return { notFound: true };
  }
}