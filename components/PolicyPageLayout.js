import Head from "next/head";
import Link from "next/link";
import Header from "@/components/Header";
import Center from "@/components/Center";
import { RESOURCE_LINKS, STORE_DETAILS } from "@/lib/storeDetails";

export default function PolicyPageLayout({
  title,
  intro,
  sections,
  eyebrow = "Store policy",
  backHref = "/",
  backLabel = "Back to home",
  supportHref = "/contact",
  supportLabel = "Contact store",
  relatedTitle = "Useful pages",
  relatedLinks = RESOURCE_LINKS,
}) {
  return (
    <>
      <Head>
        <title>{`${title} | ${STORE_DETAILS.displayName}`}</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
          <div className="theme-shell-light mx-auto max-w-4xl rounded-[1.75rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 border-b border-[rgba(20,109,126,0.12)] pb-6 sm:gap-6">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  {eyebrow}
                </span>
                <h1 className="mt-4 text-3xl font-extrabold text-[var(--foreground-strong)] sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 theme-muted-page sm:text-base sm:leading-8">
                  {intro}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {supportHref ? (
                  <Link
                    href={supportHref}
                    className="theme-footer-link inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)] sm:w-auto"
                  >
                    {supportLabel}
                  </Link>
                ) : null}
                <Link
                  href={backHref}
                  className="theme-card-light inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm sm:w-auto"
                >
                  {backLabel}
                </Link>
              </div>

              {relatedLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relatedLinks.slice(0, 4).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="theme-footer-link rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-strong)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-8 space-y-4">
              {sections.map((section) => (
                <section key={section.heading} className="theme-card-light rounded-[1.35rem] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-6">
                  <h2 className="text-lg font-bold text-[var(--foreground-strong)] sm:text-xl">{section.heading}</h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 theme-muted-page sm:text-base sm:leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <div className="theme-card-light rounded-[1.35rem] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                  Business details
                </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-[rgba(18,52,60,0.78)]">
                  <p><span className="font-semibold text-[var(--foreground-strong)]">Store:</span> {STORE_DETAILS.businessName}</p>
                  <p><span className="font-semibold text-[var(--foreground-strong)]">Phone:</span> {STORE_DETAILS.phoneNumbers.join(", ")}</p>
                  <p><span className="font-semibold text-[var(--foreground-strong)]">Email:</span> {STORE_DETAILS.email}</p>
                  <p><span className="font-semibold text-[var(--foreground-strong)]">Country:</span> {STORE_DETAILS.country}</p>
                  <p><span className="font-semibold text-[var(--foreground-strong)]">Location Code:</span> {STORE_DETAILS.locationCode}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`mailto:${STORE_DETAILS.email}`}
                    className="theme-footer-link break-all rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                  >
                    Email the store
                  </a>
                  {STORE_DETAILS.phoneNumbers.map((phoneNumber) => (
                    <a
                      key={phoneNumber}
                      href={`tel:${phoneNumber}`}
                      className="theme-footer-link rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                    >
                      Call {phoneNumber}
                    </a>
                  ))}
                </div>
              </div>

              <div className="theme-card-light rounded-[1.35rem] p-4 shadow-sm sm:rounded-[1.5rem] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                  {relatedTitle}
                </p>
                <div className="mt-4 grid gap-3 min-[420px]:grid-cols-2 lg:grid-cols-1">
                  {relatedLinks.map((policy) => (
                    <Link
                      key={policy.href}
                      href={policy.href}
                      className="theme-footer-link w-full justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                    >
                      {policy.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Center>
    </>
  );
}