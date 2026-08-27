import { cn } from "@/lib/utils";
import { useId } from "react";

const THORNS: Array<[number, number, number]> = [
  [24, 31, -30],
  [26, 35, 35],
  [28, 28, -20],
  [15, 23, -50],
  [17, 19, -38],
  [13, 21, -62],
  [35, 24, 48],
  [37, 27, 32],
  [25, 24, -12],
  [29, 33, 18],
  [21, 37, -42],
  [33, 35, 28],
];

function Thorn({ cx, cy, angle }: { cx: number; cy: number; angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const len = 1.4;
  const x1 = cx - Math.cos(rad) * len;
  const y1 = cy - Math.sin(rad) * len;
  const x2 = cx + Math.cos(rad) * len;
  const y2 = cy + Math.sin(rad) * len;
  return (
    <path
      d={`M ${x1} ${y1} L ${cx} ${cy} L ${x2} ${y2}`}
      fill="none"
      stroke="#243d2c"
      strokeWidth="0.58"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.52"
    />
  );
}

/** Wide saguaro صبار mark with verified check bubble — Sabbara Post brand icon. */
export function SabbaraBrandIcon({
  className,
  showBackground = true,
}: {
  className?: string;
  showBackground?: boolean;
}) {
  const shadowClipId = useId();
  const noiseId = useId();

  const cactusBody =
    "M 27.5 41.8 C 24.8 41.8 23.6 40.2 23.6 37.6 V 29.8 C 17.2 29.8 12.8 26.2 12.2 21.2 C 11.6 16.2 14.2 13.2 17.2 13.6 C 19.2 14 20.6 15.4 21.2 17.4 C 21.6 18.6 22.4 19.4 23.6 19.6 V 17.4 C 23.6 15.4 25.4 14.1 27.5 14.1 C 29.6 14.1 31.4 15.4 31.4 17.4 V 21.2 C 35.2 21.4 38.6 24 39.2 27.6 C 39.8 31.2 37.4 33.8 34 33.6 C 32.4 33.4 31.2 32.4 30.6 31 V 37.6 C 30.6 40.2 29.4 41.8 27.5 41.8 Z";

  return (
    <svg
      viewBox="0 0 56 52"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("sabbara-brand-icon", className)}
    >
      <defs>
        <clipPath id={shadowClipId}>
          <rect x="0" y="8" width="23.5" height="38" />
        </clipPath>
        <filter id={noiseId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
        </filter>
      </defs>

      {showBackground ? (
        <g filter={`url(#${noiseId})`}>
          <circle cx="28" cy="26" r="24" fill="#f3efe6" />
        </g>
      ) : null}

      <g>
        <path d={cactusBody} fill="#709a78" />
        <path
          d={cactusBody}
          fill="#38543f"
          clipPath={`url(#${shadowClipId})`}
          opacity="0.68"
        />
        {THORNS.map(([x, y, angle], index) => (
          <Thorn key={index} cx={x} cy={y} angle={angle} />
        ))}
      </g>

      <g>
        <circle
          cx="41.8"
          cy="14.2"
          r="7.5"
          fill="#faf8f4"
          stroke="#2d4a2d"
          strokeWidth="1.35"
        />
        <path
          d="M 37.4 17 L 35.4 15.2 Q 34.5 14.5 35.2 13.8 L 37.2 12.3 Z"
          fill="#faf8f4"
          stroke="#2d4a2d"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <path
          d="M 38 14.4 L 40.1 16.3 L 45.5 10.8"
          fill="none"
          stroke="#e07a28"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** @deprecated Use SabbaraBrandIcon */
export const SabbaraCactus = SabbaraBrandIcon;
