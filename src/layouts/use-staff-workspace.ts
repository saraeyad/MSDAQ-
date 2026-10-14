import { useEffect } from "react";

/** Marks html so portaled dialogs/menus inherit staff dark tokens, not public cream --card. */
export function useStaffWorkspaceClass() {
  useEffect(() => {
    document.documentElement.classList.add("staff-workspace");
    return () => {
      document.documentElement.classList.remove("staff-workspace");
    };
  }, []);
}
