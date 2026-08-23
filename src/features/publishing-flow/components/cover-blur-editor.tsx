import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CoverBlurEditorProps {
  imageSrc: string;
  sourceFile?: File | null;
  onSave: (file: File) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

function sameOriginMediaUrl(src: string): string {
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  try {
    const url = new URL(src, window.location.href);
    if (url.pathname.startsWith("/storage")) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    /* keep original */
  }
  return src;
}

function loadHtmlImage(src: string, useCors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

async function loadImageForCanvas(
  src: string,
  file?: File | null,
): Promise<{ image: HTMLImageElement; revokeUrl?: string }> {
  if (file) {
    const url = URL.createObjectURL(file);
    const image = await loadHtmlImage(url, false);
    return { image, revokeUrl: url };
  }

  const local = sameOriginMediaUrl(src);
  const skipCors =
    local.startsWith("blob:") ||
    local.startsWith("data:") ||
    local.startsWith("/") ||
    local.startsWith(window.location.origin);

  if (skipCors) {
    try {
      return { image: await loadHtmlImage(local, false) };
    } catch {
      /* try fetch fallback */
    }
  } else {
    try {
      return { image: await loadHtmlImage(local, true) };
    } catch {
      /* try fetch fallback */
    }
  }

  const response = await fetch(local);
  if (!response.ok) throw new Error("image-fetch-failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const image = await loadHtmlImage(url, false);
  return { image, revokeUrl: url };
}

const MAX_DISPLAY_WIDTH = 720;
const BLUR_AMOUNT = 18;

function normalizeRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);
  return { x, y, w, h };
}

function clampRect(rect: Rect, width: number, height: number): Rect {
  const x = Math.max(0, Math.min(rect.x, width));
  const y = Math.max(0, Math.min(rect.y, height));
  const w = Math.max(0, Math.min(rect.w, width - x));
  const h = Math.max(0, Math.min(rect.h, height - y));
  return { x, y, w, h };
}

/** Map a rect from display-canvas pixels → natural image pixels. */
function displayRectToNatural(
  rect: Rect,
  display: { w: number; h: number },
  natural: { w: number; h: number },
): Rect {
  if (display.w === 0 || display.h === 0) return rect;

  return clampRect(
    {
      x: (rect.x / display.w) * natural.w,
      y: (rect.y / display.h) * natural.h,
      w: (rect.w / display.w) * natural.w,
      h: (rect.h / display.h) * natural.h,
    },
    natural.w,
    natural.h,
  );
}

function applyBlurRegion(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  rect: Rect,
  amount: number,
) {
  const x = Math.round(rect.x);
  const y = Math.round(rect.y);
  const w = Math.round(rect.w);
  const h = Math.round(rect.h);
  if (w < 4 || h < 4) return;

  const slice = document.createElement("canvas");
  slice.width = w;
  slice.height = h;
  slice.getContext("2d")?.drawImage(source, x, y, w, h, 0, 0, w, h);

  const blurred = document.createElement("canvas");
  blurred.width = w;
  blurred.height = h;
  const bctx = blurred.getContext("2d");
  if (!bctx) return;

  // Expand draw so CSS blur has padding at the edges of the crop.
  const pad = Math.ceil(amount * 2);
  bctx.filter = `blur(${amount}px)`;
  bctx.drawImage(slice, -pad, -pad, w + pad * 2, h + pad * 2);

  ctx.drawImage(blurred, 0, 0, w, h, x, y, w, h);
}

export function CoverBlurEditor({
  imageSrc,
  sourceFile,
  onSave,
  onCancel,
  saving = false,
}: CoverBlurEditorProps) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const originalImageDataRef = useRef<ImageData | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  /** Selection in display-canvas pixel space (matches canvas width/height attrs). */
  const [selection, setSelection] = useState<Rect | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  /** Live CSS size of the canvas (changes when max-h / max-w constrain it). */
  const [renderSize, setRenderSize] = useState({ w: 0, h: 0 });

  const redrawDisplay = useCallback(() => {
    const source = sourceRef.current;
    const display = displayRef.current;
    if (!source || !display) return;

    const ctx = display.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, display.width, display.height);
    ctx.drawImage(source, 0, 0, display.width, display.height);
  }, []);

  const syncRenderSize = useCallback(() => {
    const canvas = displayRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setRenderSize({ w: rect.width, h: rect.height });
  }, []);

  const pushHistory = useCallback(() => {
    const source = sourceRef.current;
    if (!source) return;
    const ctx = source.getContext("2d");
    if (!ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, source.width, source.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
    setCanUndo(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let revokeUrl: string | undefined;
    setLoading(true);
    setLoadError(false);
    historyRef.current = [];
    originalImageDataRef.current = null;
    setCanUndo(false);
    setSelection(null);

    void loadImageForCanvas(imageSrc, sourceFile)
      .then(({ image, revokeUrl: url }) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        revokeUrl = url;

        const nw = image.naturalWidth;
        const nh = image.naturalHeight;
        const s = Math.min(1, MAX_DISPLAY_WIDTH / nw);
        const dw = Math.max(1, Math.round(nw * s));
        const dh = Math.max(1, Math.round(nh * s));

        const source = document.createElement("canvas");
        source.width = nw;
        source.height = nh;
        const sourceCtx = source.getContext("2d");
        sourceCtx?.drawImage(image, 0, 0, nw, nh);
        sourceRef.current = source;
        originalImageDataRef.current =
          sourceCtx?.getImageData(0, 0, nw, nh) ?? null;

        setNaturalSize({ w: nw, h: nh });
        setDisplaySize({ w: dw, h: dh });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [imageSrc, sourceFile]);

  useLayoutEffect(() => {
    if (loading || loadError) return;
    redrawDisplay();
    syncRenderSize();
  }, [displaySize, loading, loadError, redrawDisplay, syncRenderSize]);

  useEffect(() => {
    const canvas = displayRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      syncRenderSize();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [loading, displaySize.w, displaySize.h, syncRenderSize]);

  /**
   * Map pointer client coords → display-canvas bitmap pixels.
   * Uses live getBoundingClientRect so CSS max-h / max-w scaling is handled
   * independently on X and Y (the old single `scale` broke tall/wide images).
   */
  const toDisplayPoint = (clientX: number, clientY: number) => {
    const canvas = displayRef.current;
    if (!canvas || displaySize.w === 0 || displaySize.h === 0) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

    return {
      x: ((clientX - rect.left) / rect.width) * displaySize.w,
      y: ((clientY - rect.top) / rect.height) * displaySize.h,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (loading || saving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = toDisplayPoint(e.clientX, e.clientY);
    setDragging(true);
    setDragStart(point);
    setSelection({ x: point.x, y: point.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStart) return;
    const point = toDisplayPoint(e.clientX, e.clientY);
    setSelection(
      clampRect(
        normalizeRect(dragStart, point),
        displaySize.w,
        displaySize.h,
      ),
    );
  };

  const applySelectionBlur = (displaySelection: Rect) => {
    const source = sourceRef.current;
    if (!source || displaySelection.w < 8 || displaySelection.h < 8) return;

    const naturalRect = displayRectToNatural(
      displaySelection,
      displaySize,
      naturalSize,
    );
    if (naturalRect.w < 4 || naturalRect.h < 4) return;

    pushHistory();
    const ctx = source.getContext("2d");
    if (!ctx) return;

    applyBlurRegion(ctx, source, naturalRect, BLUR_AMOUNT);
    redrawDisplay();
    setSelection(null);
    setDragStart(null);
    setDragging(false);
  };

  const finishPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const point = toDisplayPoint(e.clientX, e.clientY);
    const finalSelection = dragStart
      ? clampRect(
          normalizeRect(dragStart, point),
          displaySize.w,
          displaySize.h,
        )
      : selection;

    setDragging(false);

    if (finalSelection && finalSelection.w >= 8 && finalSelection.h >= 8) {
      applySelectionBlur(finalSelection);
    } else {
      setSelection(null);
      setDragStart(null);
    }
  };

  const undoBlur = () => {
    const source = sourceRef.current;
    const previous = historyRef.current.pop();
    if (!source || !previous) return;

    source.getContext("2d")?.putImageData(previous, 0, 0);
    setCanUndo(historyRef.current.length > 0);
    redrawDisplay();
    setSelection(null);
  };

  const resetImage = () => {
    const source = sourceRef.current;
    const original = originalImageDataRef.current;
    if (!source || !original) return;

    historyRef.current = [];
    setCanUndo(false);
    setSelection(null);
    setDragStart(null);
    setDragging(false);

    source.getContext("2d")?.putImageData(original, 0, 0);
    redrawDisplay();
  };

  const handleSave = () => {
    const source = sourceRef.current;
    if (!source) return;

    source.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "cover-blurred.jpg", {
          type: "image/jpeg",
        });
        await onSave(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  const selectionStyle =
    selection && displaySize.w > 0 && displaySize.h > 0 && renderSize.w > 0
      ? {
          left: (selection.x / displaySize.w) * renderSize.w,
          top: (selection.y / displaySize.h) * renderSize.h,
          width: (selection.w / displaySize.w) * renderSize.w,
          height: (selection.h / displaySize.h) * renderSize.h,
        }
      : null;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium">أداة التمويه</p>
        <p className="mt-1 text-xs text-muted-foreground">
          اسحب على الصورة لتحديد منطقة — سيتم تمويهها تلقائياً. كرّر لعدة
          مناطق، ثم ارفع النسخة المعدّلة.
        </p>
      </div>

      <div className="cover-blur-stage">
        {loading ? (
          <div className="cover-blur-stage__state">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p>جاري تجهيز الصورة...</p>
          </div>
        ) : loadError ? (
          <div className="cover-blur-stage__state">
            <p>تعذّر تحميل الصورة للتمويه.</p>
            <p className="cover-blur-stage__hint">
              أغلقي الأداة ثم ارفعي الصورة مجدداً وحاولي مرة أخرى.
            </p>
          </div>
        ) : (
          <div className="cover-blur-stage__canvas-wrap">
            <canvas
              ref={displayRef}
              width={displaySize.w}
              height={displaySize.h}
              className="cover-blur-stage__canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointer}
              onPointerCancel={finishPointer}
            />
            {selectionStyle && (
              <div
                className="pointer-events-none absolute rounded-sm border-2 border-primary bg-primary/10"
                style={selectionStyle}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undoBlur}
          disabled={!canUndo || saving || loading || loadError}
        >
          <Undo2 className="size-4" />
          تراجع
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetImage}
          disabled={saving || loading || loadError}
        >
          <RotateCcw className="size-4" />
          إعادة ضبط
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving || loading || loadError}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          رفع النسخة المعدّلة
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}
