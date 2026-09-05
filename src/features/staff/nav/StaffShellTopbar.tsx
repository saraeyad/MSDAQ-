import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StaffHomeLink } from "@/features/staff/nav/StaffHomeLink";
import { StaffNavLinks } from "@/features/staff/nav/StaffNavLinks";
import { StaffUserMenu } from "@/features/staff/nav/StaffUserMenu";
import type { StaffNavItem } from "@/features/staff/nav/staff-nav";
import { Menu } from "lucide-react";
import { useState } from "react";

export function StaffShellTopbar({ items }: { items: StaffNavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="staff-shell__topbar">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="staff-shell__menu-btn"
            aria-label="فتح القائمة"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="staff-shell__brand text-start">
            <BrandLogo fill linkToHome={false} />
            <SheetTitle className="sr-only">القائمة</SheetTitle>
          </SheetHeader>
          <div className="staff-shell__mobile-nav">
            <StaffNavLinks
              items={items}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="staff-shell__topbar-actions">
        <StaffHomeLink />
        <StaffUserMenu />
      </div>
    </header>
  );
}
