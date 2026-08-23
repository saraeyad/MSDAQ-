import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  badge?: string;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  label,
  badge,
  className,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const preview = hovered || value;

  return (
    <div className={cn("star-rating", className)}>
      {badge || label ? (
        <div className="star-rating__head">
          {badge ? <span className="star-rating__badge">{badge}</span> : null}
          {label ? <p className="star-rating__label">{label}</p> : null}
        </div>
      ) : null}
      <div
        className="star-rating__row"
        role="radiogroup"
        aria-label={label ?? badge}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((score) => {
          const active = score <= preview;
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={value === score}
              disabled={disabled}
              className={cn(
                "star-rating__star",
                active && "star-rating__star--active",
              )}
              onMouseEnter={() => setHovered(score)}
              onClick={() => onChange(score)}
            >
              <Star
                className="size-5"
                fill={active ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="sr-only">{score}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
