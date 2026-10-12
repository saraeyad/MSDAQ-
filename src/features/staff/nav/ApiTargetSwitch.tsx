import { API_TARGET_COOKIE, PRODUCTION_API_URL, STAGING_API_URL } from "@/lib/api/api-targets";

const options = [
  ["staging", "التجربة", STAGING_API_URL],
  ["production", "الإنتاج", PRODUCTION_API_URL],
] as const;

function selectedTarget() {
  return document.cookie.includes(`${API_TARGET_COOKIE}=production`)
    ? "production"
    : "staging";
}

/** Local dev only. Reloads and signs out because each server has its own login. */
export function ApiTargetSwitch() {
  if (!import.meta.env.DEV) return null;
  const active = selectedTarget();

  return (
    <div className="inline-flex rounded-full border bg-muted p-0.5" role="group" aria-label="خادم البيانات">
      {options.map(([id, label, origin]) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            title={origin}
            className={
              on
                ? `rounded-full px-2.5 py-1 text-xs font-bold text-white ${id === "production" ? "bg-[#c41e3a]" : "bg-[#2d4a2d]"}`
                : "rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground"
            }
            onClick={() => {
              if (on) return;
              document.cookie = `${API_TARGET_COOKIE}=${id}; Path=/; Max-Age=31536000; SameSite=Lax`;
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.reload();
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
