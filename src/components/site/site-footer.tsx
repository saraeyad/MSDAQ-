import { BrandLogo } from "@/components/brand/brand-logo";
import { usePublicCopy } from "@/context/locale";
import {
  buildPublicFooterSections,
  buildStaticFooterLinksFromCopy,
} from "@/features/public-site/categories/public-nav";
import { usePublicCategories } from "@/hooks/public";
import { ROUTES } from "@/router/routes";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { href: "https://cdmcgaza.ps/ar/", label: "الموقع" },
  { href: "https://www.instagram.com/cdmcgaza/", label: "Instagram" },
  { href: "https://www.facebook.com/cdmcgaza/?locale=ar_AR", label: "Facebook" },
];

const CONTACT = {
  email: "cdmc@cdmcgaza.ps",
  phone: "00970592432020",
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
    <footer id="site-footer" className={cn("site-footer", className)}>
      <div className="site-footer__inner container-page">
        <div className="site-footer__brand">
          <BrandLogo linkToHome size="md" onDark />
          <p className="site-footer__tagline">{footer.tagline}</p>
          <div className="site-footer__social">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__social-link"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <nav className="site-footer__col" aria-label={footer.sections}>
          <h4 className="site-footer__heading">{footer.sections}</h4>
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
                            <span className="site-footer-section__dot" aria-hidden>
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
            <ul className="site-footer__list">
              {staticLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="site-footer__col">
          <h4 className="site-footer__heading">{footer.info}</h4>
          <ul className="site-footer__list">
            {policyLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <ul className="site-footer__contact">
            <li>
              <MapPin className="size-4" aria-hidden />
              <span>{footer.location}</span>
            </li>
            <li>
              <Mail className="size-4" aria-hidden />
              <a href={`mailto:${CONTACT.email}`} dir="ltr">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <Phone className="size-4" aria-hidden />
              <a href={`tel:${CONTACT.phone}`} dir="ltr">
                {CONTACT.phone}
              </a>
            </li>
          </ul>
        </div>

        <div className="site-footer__map">
          <h4 className="site-footer__heading">{footer.mapHeading}</h4>
          <div className="site-footer__map-frame">
            <iframe
              title={footer.mapTitle}
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="site-footer__legal">
        <div className="container-page site-footer__legal-inner">
          <p>{footer.copyright(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
