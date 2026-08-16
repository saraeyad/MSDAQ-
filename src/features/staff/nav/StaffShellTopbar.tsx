import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StaffNavLinks } from "@/features/staff/nav/StaffNavLinks";
import { StaffUserMenu } from "@/features/staff/nav/StaffUserMenu";
import { STAFF_ORG_LABEL, type StaffNavItem } from "@/features/staff/nav/staff-nav";
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
          <SheetHeader className="border-b border-border p-4 text-start">
            <BrandLogo size="md" linkToHome={false} className="mb-2" />
            <SheetTitle className="font-headline text-sm leading-snug">
              {STAFF_ORG_LABEL}
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-3">
            <StaffNavLinks
              items={items}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <StaffUserMenu />
    </header>
  );
}
