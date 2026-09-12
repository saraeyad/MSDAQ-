import { BrandLogo } from "@/components/brand/brand-logo";
import { usePublicCopy } from "@/context/locale";
import {
  buildPublicFooterSections,
  buildStaticFooterLinksFromCopy,
} from "@/features/public-site/categories/public-nav";
import { usePublicCategories } from "@/hooks/public";
import { ROUTES } from "@/router/routes";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { href: "https://cdmcgaza.ps/ar/", label: "الموقع" },
  { href: "https://www.instagram.com/cdmcgaza/", label: "Instagram" },
  { href: "https://www.facebook.com/cdmcgaza/?locale=ar_AR", label: "Facebook" },
];

const CONTACT = {
  email: "cdmc@cdmcgaza.ps",
  phone: "00970592432020",
  address: "Gaza — Al-Naser St.",
} as const;

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108716.77!2d34.3!3d31.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1500492432b8c4b1%3A0x7c0e0e0e0e0e0e0e!2sGaza%20City!5e0!3m2!1sen!2sps!4v1700000000000!5m2!1sen!2sps";

export function SiteFooter({ className }: { className?: string }) {
  const { data: categories } = usePublicCategories();
  const { footer } = usePublicCopy();
  const sections =
    categories && categories.length > 0
      ? buildPublicFooterSections(categories)
      : [];
  const staticLinks = buildStaticFooterLinksFromCopy(footer);

  const policyLinks = [
    { to: ROUTES.ABOUT, label: footer.aboutUs },
    { to: ROUTES.PARTNERS, label: footer.partners },
    { to: ROUTES.SITE_POLICY, label: footer.sitePolicy },
    { to: ROUTES.TERMS, label: footer.terms },
  ];

  return (
    <footer className={cn("site-footer mt-16 text-white", className)}>
      <div className="container-page grid gap-6 py-7 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <BrandLogo linkToHome size="lg" onDark />
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            {footer.tagline}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/80 transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                <Share2 className="size-3" />
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <h4 className="font-headline text-base font-semibold">
            {footer.sections}
          </h4>
          {sections.length > 0 ? (
            <div className="site-footer-sections">
              {sections.map((section) => (
                <div key={section.to} className="site-footer-section">
                  <Link to={section.to} className="site-footer-section__title">
                    {section.label}
                  </Link>
                  {section.children.length > 0 ? (
                    <p className="site-footer-section__children">
                      {section.children.map((child, index) => (
                        <span key={child.to}>
                          {index > 0 ? (
                            <span
                              className="site-footer-section__dot"
                              aria-hidden
                            >
                              ·
                            </span>
                          ) : null}
                          <Link to={child.to}>{child.label}</Link>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {staticLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-headline text-base font-semibold">
            {footer.info}
          </h4>
          <ul className="mt-3 space-y-1.5">
            {policyLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1.5 text-xs text-white/70">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              {footer.location}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              {CONTACT.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              {CONTACT.phone}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h4 className="font-headline text-base font-semibold">
            {footer.mapHeading}
          </h4>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={footer.mapTitle}
              src={MAP_EMBED}
              className="h-36 w-full grayscale-[30%] contrast-[1.1] md:h-40"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-1 py-2.5 text-center text-xs text-white/50 sm:flex-row sm:text-start">
          <p>© {new Date().getFullYear()} صبّارة بوست — جميع الحقوق محفوظة</p>
          <p>صبّارة بوست</p>
        </div>
      </div>
    </footer>
  );
}
