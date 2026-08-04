import { Input } from "@/components/ui/input";
import { ROUTES } from "@/router/routes";
import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function SiteHeaderSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (location.pathname !== ROUTES.ARTICLES) return;
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") ?? "");
  }, [location.pathname, location.search]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const q = query.trim();
    if (!q) {
      navigate(ROUTES.ARTICLES);
      return;
    }
    navigate(`${ROUTES.ARTICLES}?search=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className={className}
      role="search"
      aria-label="بحث في المقالات"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث في المقالات..."
          className="site-header-search-input h-9 w-full ps-8"
        />
      </div>
    </form>
  );
}
