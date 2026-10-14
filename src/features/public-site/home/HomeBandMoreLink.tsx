import { useLocale } from "@/context/locale";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HomeBandMoreLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  const { dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Link className="home-feed-band__more home-feed-band__more-row" to={to}>
      <span>{label}</span>
      <Arrow className="home-feed-band__more-arrow" aria-hidden />
    </Link>
  );
}
