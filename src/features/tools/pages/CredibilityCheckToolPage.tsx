import { CredibilityUnavailableNote } from "@/features/tools/components/CredibilityUnavailableNote";
import { ToolPageShell } from "./ToolPageShell";

export function CredibilityCheckToolPage() {
  return (
    <ToolPageShell title="فحص المصداقية">
      <CredibilityUnavailableNote />
    </ToolPageShell>
  );
}
