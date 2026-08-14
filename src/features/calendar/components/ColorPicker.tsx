import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CALENDAR_TYPE_COLORS } from "@/lib/calendar-feed";
import { cn } from "@/lib/utils";
import { ChevronDown, Pipette } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Collapse into a swatch trigger; full picker opens in a popover. */
  compact?: boolean;
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  if (/^[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex) ?? CALENDAR_TYPE_COLORS.task;
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) =>
      clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"),
    )
    .join("")}`;
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  return { h, s: s * 100, v: max * 100 };
}

function hsvToRgb(h: number, s: number, v: number) {
  const sat = clamp(s, 0, 100) / 100;
  const val = clamp(v, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) [rp, gp, bp] = [c, x, 0];
  else if (hue < 120) [rp, gp, bp] = [x, c, 0];
  else if (hue < 180) [rp, gp, bp] = [0, c, x];
  else if (hue < 240) [rp, gp, bp] = [0, x, c];
  else if (hue < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(hsv: Hsv) {
  const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
  return rgbToHex(r, g, b);
}

function supportsEyeDropper() {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

function ColorPickerPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const safeHex = normalizeHex(value) ?? CALENDAR_TYPE_COLORS.task;
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(safeHex));
  const [hexInput, setHexInput] = useState(safeHex.toUpperCase());
  const [opacity, setOpacity] = useState(100);
  const [eyeDropperAvailable, setEyeDropperAvailable] = useState(false);

  useEffect(() => {
    setEyeDropperAvailable(supportsEyeDropper());
  }, []);

  useEffect(() => {
    const next = normalizeHex(value);
    if (!next) return;
    setHsv(hexToHsv(next));
    setHexInput(next.toUpperCase());
  }, [value]);

  const solidHex = useMemo(() => hsvToHex(hsv), [hsv]);
  const opaqueColor = solidHex;
  const alphaColor = useMemo(() => {
    const { r, g, b } = hexToRgb(solidHex);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }, [solidHex, opacity]);

  const commitHex = (hex: string) => {
    const next = normalizeHex(hex);
    if (!next) return;
    onChange(next);
    setHsv(hexToHsv(next));
    setHexInput(next.toUpperCase());
  };

  const updateHsv = (patch: Partial<Hsv>) => {
    const next = { ...hsv, ...patch };
    setHsv(next);
    const hex = hsvToHex(next);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  };

  const pickFromScreen = async () => {
    if (!supportsEyeDropper()) return;
    try {
      const EyeDropperCtor = (
        window as Window & {
          EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
        }
      ).EyeDropper;
      if (!EyeDropperCtor) return;
      const result = await new EyeDropperCtor().open();
      commitHex(result.sRGBHex);
    } catch {
      // User cancelled eyedropper.
    }
  };

  return (
    <div className="calendar-color-picker">
      <div className="calendar-color-picker__top">
        <button
          type="button"
          className="calendar-color-picker__eyedropper"
          onClick={() => void pickFromScreen()}
          disabled={!eyeDropperAvailable}
          title={
            eyeDropperAvailable
              ? "اختيار لون من الشاشة"
              : "أداة القطارة غير مدعومة في هذا المتصفح"
          }
          aria-label="اختيار لون من الشاشة"
        >
          <Pipette className="size-4" strokeWidth={1.75} />
        </button>

        <div className="calendar-color-picker__sliders">
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(hsv.h)}
            onChange={(e) => updateHsv({ h: Number(e.target.value) })}
            className="calendar-color-picker__hue"
            aria-label="درجة اللون"
            style={{
              ["--thumb-color" as string]: opaqueColor,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="calendar-color-picker__alpha"
            aria-label="الشفافية"
            style={{
              ["--alpha-color" as string]: opaqueColor,
              ["--thumb-color" as string]: alphaColor,
            }}
          />
        </div>
      </div>

      <div className="calendar-color-picker__value">
        <span
          className="calendar-color-picker__dot"
          style={{ backgroundColor: alphaColor }}
          aria-hidden
        />
        <input
          value={hexInput}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setHexInput(next.startsWith("#") ? next : `#${next}`);
          }}
          onBlur={() => {
            const next = normalizeHex(hexInput);
            if (next) commitHex(next);
            else setHexInput(solidHex.toUpperCase());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="calendar-color-picker__hex"
          dir="ltr"
          spellCheck={false}
          maxLength={7}
          aria-label="رمز اللون"
        />
        <span className="calendar-color-picker__divider" aria-hidden />
        <span className="calendar-color-picker__opacity" dir="ltr">
          {opacity}%
        </span>
      </div>
    </div>
  );
}

export function ColorPicker({
  label = "اللون",
  value,
  onChange,
  className,
  compact = false,
}: ColorPickerProps) {
  const safeHex = normalizeHex(value) ?? CALENDAR_TYPE_COLORS.task;

  if (compact) {
    return (
      <div className={cn("calendar-form-field", className)}>
        {label ? (
          <Label className="calendar-form-field__label">{label}</Label>
        ) : null}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="calendar-color-trigger">
              <span
                className="calendar-color-trigger__swatch"
                style={{ backgroundColor: safeHex }}
                aria-hidden
              />
              <span className="calendar-color-trigger__hex" dir="ltr">
                {safeHex.toUpperCase()}
              </span>
              <ChevronDown className="calendar-color-trigger__chevron size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(100vw-2rem,20rem)] p-0">
            <ColorPickerPanel value={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className={cn("calendar-form-field", className)}>
      {label ? (
        <Label className="calendar-form-field__label">{label}</Label>
      ) : null}
      <ColorPickerPanel value={value} onChange={onChange} />
    </div>
  );
}
