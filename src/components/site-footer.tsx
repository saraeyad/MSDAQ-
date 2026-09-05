import { BrandLogo } from "@/components/brand-logo";
import { usePlatformFeedback } from "@/context/platform-feedback";
import {
  buildPublicFooterSections,
  STATIC_FOOTER_LINKS,
} from "@/features/public-site/categories/public-nav";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { ROUTES } from "@/router/routes";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const POLICY_LINKS = [
  { to: ROUTES.ABOUT, label: "من نحن" },
  { to: ROUTES.PARTNERS, label: "شركاؤنا" },
  { to: ROUTES.SITE_POLICY, label: "سياسة الموقع" },
  { to: ROUTES.TERMS, label: "الشروط والأحكام" },
  { to: ROUTES.TOOLS_OVERVIEW, label: "أدوات التحقق" },
];

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "فيسبوك" },
  { href: "https://instagram.com", label: "إنستغرام" },
  { href: "https://youtube.com", label: "يوتيوب" },
  { href: "https://linkedin.com", label: "لينكدإن" },
];

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108716.77!2d34.3!3d31.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1500492432b8c4b1%3A0x7c0e0e0e0e0e0e0e!2sGaza%20City!5e0!3m2!1sen!2sps!4v1700000000000!5m2!1sen!2sps";

export function SiteFooter() {
  const { data: categories } = usePublicCategories();
  const { openFeedback } = usePlatformFeedback();
  const sections =
    categories && categories.length > 0
      ? buildPublicFooterSections(categories)
      : [];

  return (
    <footer className="mt-16 bg-[#1a1a1a] text-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <BrandLogo linkToHome size="lg" onDark />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            صبارة بوست — منصة إعلامية موثوقة تمكّن المجتمع من مواجهة
            المعلومات المضللة.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-primary hover:bg-primary hover:text-white"
              >
                <Share2 className="size-3" />
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <h4 className="font-headline text-base font-semibold">الأقسام</h4>
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
            <ul className="mt-4 space-y-2.5">
              {STATIC_FOOTER_LINKS.map((link) => (
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
          <h4 className="font-headline text-base font-semibold">معلومات</h4>
          <ul className="mt-4 space-y-2.5">
            {POLICY_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/70 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="text-sm text-white/70 transition-colors hover:text-primary"
                onClick={openFeedback}
              >
                شاركنا رأيك
              </button>
            </li>
          </ul>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              غزة، فلسطين
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              صبارة بوست
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              +970 000 000 000
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <h4 className="font-headline text-base font-semibold">موقعنا</h4>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <iframe
              title="موقع صبارة بوست على الخريطة"
              src={MAP_EMBED}
              className="h-52 w-full grayscale-[30%] contrast-[1.1] md:h-56"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-center text-xs text-white/50 sm:flex-row sm:text-start">
          <p>© {new Date().getFullYear()} صبارة بوست — جميع الحقوق محفوظة</p>
          <p>صبارة بوست</p>
        </div>
      </div>
    </footer>
  );
}