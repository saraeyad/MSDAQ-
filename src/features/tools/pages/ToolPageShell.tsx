import { BackLink } from "@/components/BackLink";
import { ROUTES } from "@/router/routes";

interface ToolPageShellProps {
  title: string;
  children: React.ReactNode;
}

export function ToolPageShell({ title, children }: ToolPageShellProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink to={ROUTES.NEWSROOM_TOOLS} label="العودة للأدوات" />
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
}
