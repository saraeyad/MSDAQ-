import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
      <Link to={to}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
