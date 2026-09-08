import { usePublicCopy } from "@/context/locale";
import { Button } from "@/components/ui/button";
import { useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "sabbara-pilot-welcome:v2";

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markWelcomeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function PilotLaunchWelcome() {
  const { welcome } = usePublicCopy();
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasSeenWelcome()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 420);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const dismiss = () => {
    markWelcomeSeen();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="pilot-welcome" role="presentation">
      <button
        type="button"
        className="pilot-welcome__backdrop"
        aria-label={welcome.close}
        onClick={dismiss}
      />
      <div
        ref={cardRef}
        className="pilot-welcome__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <p className="pilot-welcome__kicker">{welcome.kicker}</p>
        <h2 id={titleId} className="pilot-welcome__title">
          <span className="pilot-welcome__title-line">{welcome.titleLine}</span>
          <span className="pilot-welcome__title-after">{welcome.titleAfter}</span>
        </h2>
        <p className="pilot-welcome__lead">{welcome.lead}</p>

        <Button className="pilot-welcome__cta" onClick={dismiss}>
          {welcome.cta}
        </Button>
      </div>
    </div>
  );
}
