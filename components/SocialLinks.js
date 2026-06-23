const PLATFORM_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  website: "Website",
};

function getPlatformLabel(platform) {
  const key = String(platform || "").trim().toLowerCase();
  return PLATFORM_LABELS[key] || platform || "Social";
}

function getDisplayText(link) {
  return link.label || link.handle || getPlatformLabel(link.platform);
}

export default function SocialLinks({ links = [], variant = "store" }) {
  const visibleLinks = (Array.isArray(links) ? links : []).filter((link) => link?.active !== false && (link?.url || link?.handle));

  if (!visibleLinks.length) {
    return null;
  }

  const isHotel = variant === "hotel";
  const shellClass = isHotel
    ? "hotel-shell-card border border-[rgba(216,172,79,0.12)] bg-[rgba(255,250,243,0.08)]"
    : "store-shell-card border border-[rgba(31,44,51,0.08)] bg-[rgba(255,255,255,0.62)]";
  const textClass = isHotel ? "text-[#fff1dc]" : "text-[var(--foreground-strong)]";
  const mutedClass = isHotel ? "text-[rgba(245,238,226,0.62)]" : "text-[rgba(18,52,60,0.52)]";
  const linkClass = isHotel ? "hotel-footer-link" : "store-footer-link";

  return (
    <div className={`${shellClass} rounded-[1.25rem] px-4 py-4 shadow-sm`}>
      <p className={`${mutedClass} text-[0.72rem] font-semibold uppercase tracking-[0.22em]`}>Social media</p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {visibleLinks.map((link, index) => {
          const label = getDisplayText(link);
          const platformLabel = getPlatformLabel(link.platform);
          const content = (
            <>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{platformLabel}</span>
              <span className={`${textClass} text-sm font-semibold`}>{label}</span>
            </>
          );

          return link.url ? (
            <a
              key={`${link.platform}-${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} inline-flex min-h-[3rem] items-center gap-2 rounded-[1rem] px-4 py-2`}
            >
              {content}
            </a>
          ) : (
            <span
              key={`${link.platform}-${link.handle}-${index}`}
              className={`${linkClass} inline-flex min-h-[3rem] items-center gap-2 rounded-[1rem] px-4 py-2`}
            >
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
