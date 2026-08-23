import { cn } from "@/lib/utils";

export function OliveBranch({
  className,
  flip,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 18 36"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn(flip && "scale-x-[-1]", className)}
    >
      <path
        d="M9 34 C9 26 7.5 18 9 10 C9.5 5 9 2 9 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <ellipse
        cx="5.5"
        cy="11"
        rx="3.8"
        ry="2.2"
        transform="rotate(-38 5.5 11)"
        fill="currentColor"
      />
      <ellipse
        cx="12"
        cy="17"
        rx="3.8"
        ry="2.2"
        transform="rotate(38 12 17)"
        fill="currentColor"
      />
      <ellipse
        cx="5"
        cy="23"
        rx="3.2"
        ry="1.9"
        transform="rotate(-32 5 23)"
        fill="currentColor"
      />
      <ellipse
        cx="11.5"
        cy="8"
        rx="2.8"
        ry="1.6"
        transform="rotate(42 11.5 8)"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
