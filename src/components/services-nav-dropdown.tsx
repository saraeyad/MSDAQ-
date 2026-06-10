import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useDir from "@/hooks/use-dir";
import { cn } from "@/lib/utils";
import { isPublicToolPath, PUBLIC_TOOLS, type PublicTool } from "@/lib/tool-config";
import { useAuth } from "@/context/auth";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

function ServiceToolLink({
  tool,
  path,
  onNavigate,
  showBadge = true,
}: {
  tool: PublicTool;
  path: string;
  onNavigate?: () => void;
  showBadge?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const Icon = tool.icon;
  const direction = i18n.dir();

  return (
    <Link
      to={path}
      onClick={onNavigate}
      dir={direction}
      className="flex w-full flex-row items-center gap-2.5 rounded-md px-2 py-2.5 text-start transition-colors hover:bg-muted/60"
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md border",
          tool.accent.bg,
          tool.accent.border,
          tool.accent.text,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-foreground">
          {t(tool.i18n.title)}
        </p>
        {showBadge ? (
          <p className="truncate text-[10px] text-muted-foreground">
            {t(tool.i18n.badge)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function ServicesNavDropdownDesktop() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useDir();
  const { user } = useAuth();
  const location = useLocation();
  const isJournalist = user?.role === "journalist";
  const isActive = isPublicToolPath(location.pathname);
  const direction = i18n.dir();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      key={i18n.resolvedLanguage}
      dir={direction}
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          dir={direction}
          className={cn(
            "nav-link inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium outline-none",
            isActive && "nav-link-active text-secondary",
          )}
        >
          {t("MENU.SERVICES")}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        className="w-[280px] p-1.5"
        style={{ direction }}
      >
        {PUBLIC_TOOLS.map((tool) => (
          <DropdownMenuItem key={tool.id} asChild className="flex-row p-0 focus:bg-transparent">
            <ServiceToolLink
              tool={tool}
              path={tool.getPath({ isJournalist })}
              onNavigate={() => setOpen(false)}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ServicesNavDropdownMobile({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isJournalist = user?.role === "journalist";
  const [open, setOpen] = useState(false);
  const direction = i18n.dir();

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div dir={direction}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>{t("MENU.SERVICES")}</span>
        <ChevronDown
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="space-y-0.5 py-2 ps-2">
          {PUBLIC_TOOLS.map((tool) => (
            <ServiceToolLink
              key={tool.id}
              tool={tool}
              path={tool.getPath({ isJournalist })}
              onNavigate={handleNavigate}
              showBadge={false}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
