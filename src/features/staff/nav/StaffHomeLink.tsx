import { OliveBranch } from "@/components/ghazawiya/olive-branch";
import { ROUTES } from "@/router/routes";
import { Link } from "react-router-dom";

export function StaffHomeLink() {
  return (
    <Link to={ROUTES.HOME} className="staff-home-link">
      <span className="staff-home-link__seal" aria-hidden>
        <svg
          className="staff-home-link__house"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 11.2 12 4.5l8 6.7V20a1 1 0 0 1-1 1h-5.2v-5.4H10.2V21H5a1 1 0 0 1-1-1v-8.8Z"
            fill="currentColor"
          />
        </svg>
        <OliveBranch className="staff-home-link__leaf staff-home-link__leaf--start" />
        <OliveBranch flip className="staff-home-link__leaf staff-home-link__leaf--end" />
      </span>
      <span className="staff-home-link__copy">
        <span className="staff-home-link__title">إلى الموقع</span>
      </span>
      <span className="staff-home-link__exit" aria-hidden>
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="M6.2 3.2H4.1A1.1 1.1 0 0 0 3 4.3v7.4c0 .6.5 1.1 1.1 1.1h2.1M8.4 8h5.2M11.4 5.8 13.6 8l-2.2 2.2"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
