import {
  groupPermissions,
  permissionGroupAccent,
  permissionGroupLabel,
  permissionLabel,
} from "@/lib/permission-labels";
import { useMemo } from "react";

interface RolePermissionsSummaryProps {
  permissions: string[];
}

export function RolePermissionsSummary({
  permissions,
}: RolePermissionsSummaryProps) {
  const groups = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  if (permissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">لا صلاحيات مرتبطة بهذا الدور.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {[...groups.entries()].map(([groupKey, perms]) => {
        const accent = permissionGroupAccent(groupKey);

        return (
          <section
            key={groupKey}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card"
            style={{ ["--perm-accent" as string]: accent }}
          >
            <header
              className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5"
              style={{
                borderInlineStart: `3px solid ${accent}`,
                background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 14%, white) 0%, #fff 72%)`,
              }}
            >
              <p className="font-headline text-xs font-bold text-foreground">
                {permissionGroupLabel(groupKey)}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `color-mix(in srgb, ${accent} 16%, white)`,
                  color: accent,
                }}
              >
                {perms.length}
              </span>
            </header>

            <ul className="flex flex-col gap-1 p-2.5">
              {perms.map((perm) => (
                <li
                  key={perm}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/90"
                  style={{
                    background: `color-mix(in srgb, ${accent} 8%, white)`,
                  }}
                  title={perm}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="min-w-0 leading-snug">
                    {permissionLabel(perm)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
