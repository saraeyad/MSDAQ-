import { ArticleEntityBody } from "@/features/public-site/article-page/ArticleEntityBody";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Entities_APIs } from "@/services/api/entities";
import type {
  EntityLinkType,
  EntitySearchResult,
  EntityWritePayload,
  StaffArticleEntity,
} from "@/types";
import {
  ArrowUpLeft,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export interface LocalEntityTag {
  key: string;
  id?: number;
  name: string;
  link_type: EntityLinkType;
  url: string;
  match_text: string;
}

export function tagsFromStaffEntities(
  entities: StaffArticleEntity[] | null | undefined,
): LocalEntityTag[] {
  return (entities ?? []).map((entity, index) => ({
    key: `saved-${entity.id}-${entity.match_text}-${index}`,
    id: entity.id,
    name: entity.name,
    link_type: entity.link_type,
    url: entity.url,
    match_text: entity.match_text,
  }));
}

export function tagsToWritePayload(
  tags: LocalEntityTag[],
  corpus: string,
): EntityWritePayload[] {
  return tags
    .filter((tag) => tag.match_text && corpus.includes(tag.match_text))
    .map((tag) =>
      tag.id
        ? { id: tag.id, match_text: tag.match_text }
        : {
            match_text: tag.match_text,
            name: tag.name,
            link_type: tag.link_type,
            url: tag.url,
          },
    );
}

export function readTextSelection(target: EventTarget | null): string {
  if (
    !(target instanceof HTMLTextAreaElement) &&
    !(target instanceof HTMLInputElement)
  ) {
    return "";
  }
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;
  return target.value.slice(start, end);
}

export interface EntityPreviewBlock {
  label?: string;
  text: string;
}

interface EntityTaggingPanelProps {
  corpus: string;
  selection: string;
  tags: LocalEntityTag[];
  onChange: (tags: LocalEntityTag[]) => void;
  onClearSelection?: () => void;
  heading?: string;
  hint?: string;
  dockHint?: string;
  previewBlocks?: EntityPreviewBlock[];
  variant?: "studio" | "embedded";
  children: ReactNode;
}

export function EntityTaggingPanel({
  corpus,
  selection,
  tags,
  onChange,
  onClearSelection,
  heading = "٢ · محتوى المقال والروابط",
  hint = "حدّد اسماً في النص ثم اربطه. النص يبقى عادياً — الروابط تُرسم عند القراءة فقط.",
  dockHint = "حدّد اسماً أو جملة في النص — ستظهر بطاقة الربط فوراً",
  previewBlocks,
  variant = "studio",
  children,
}: EntityTaggingPanelProps) {
  const [open, setOpen] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(tags.length > 0);
  const [pinned, setPinned] = useState("");

  const liveSelection = selection.trim();
  const hasLiveSelection =
    liveSelection.length > 0 && corpus.includes(liveSelection);

  useEffect(() => {
    if (!hasLiveSelection || open) return;
    const timer = window.setTimeout(() => {
      setPinned(liveSelection);
      setPickOpen(true);
    }, 70);
    return () => window.clearTimeout(timer);
  }, [hasLiveSelection, liveSelection, open]);

  const matchText = liveSelection || pinned;
  const canOpen = matchText.length > 0 && corpus.includes(matchText);
  const blocks =
    previewBlocks ??
    (corpus.trim() ? [{ text: corpus }] : []);
  const hasPreviewText = blocks.some((block) => block.text.trim());

  const closePick = () => {
    setPickOpen(false);
    onClearSelection?.();
  };

  const openDialog = () => {
    if (!canOpen) return;
    setPickOpen(false);
    setOpen(true);
  };

  return (
    <div
      className={cn(
        "entity-studio",
        variant === "embedded" && "entity-studio--embedded",
      )}
    >
      <header className="entity-studio__head">
        <div className="entity-studio__intro">
          <span className="entity-studio__mark" aria-hidden>
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <p className="entity-studio__title">{heading}</p>
            <p className="entity-studio__hint">{hint}</p>
          </div>
        </div>
        <span className="entity-studio__count">
          {tags.length} {tags.length === 1 ? "رابط" : "روابط"}
        </span>
      </header>

      <div
        className={cn(
          "entity-studio__editor",
          variant === "embedded" && "entity-studio__editor--fields",
          canOpen && "entity-studio__editor--ready",
        )}
      >
        {children}

        <div className="entity-studio__dock">
          <p className="entity-studio__dock-idle">{dockHint}</p>
        </div>
      </div>

      {pickOpen && canOpen && !open ? (
        <EntitySelectModal
          matchText={matchText}
          onLink={openDialog}
          onClose={closePick}
        />
      ) : null}

      <section className="entity-studio__tags" aria-label="الروابط المضافة">
        {tags.length === 0 ? (
          <div className="entity-studio__empty">
            <Link2 className="size-5" />
            <p>
              لا روابط بعد — حدّد اسماً في العنوان أو الوصف أو النص ثم اربطه.
            </p>
          </div>
        ) : (
          <ul className="entity-studio__list">
            {tags.map((tag) => {
              const missing = !corpus.includes(tag.match_text);
              return (
                <li
                  key={tag.key}
                  className={cn(
                    "entity-chip",
                    tag.link_type === "external" && "entity-chip--external",
                    missing && "entity-chip--missing",
                  )}
                >
                  <span className="entity-chip__text">{tag.match_text}</span>
                  <span className="entity-chip__kind">
                    {tag.link_type === "internal" ? "داخل المنصة" : "خارجي"}
                  </span>
                  <span className="entity-chip__url" dir="ltr">
                    {tag.url}
                  </span>
                  {missing ? (
                    <span className="entity-chip__warn">لم يعد في النص</span>
                  ) : null}
                  <button
                    type="button"
                    className="entity-chip__remove"
                    aria-label={`إزالة ${tag.match_text}`}
                    onClick={() =>
                      onChange(tags.filter((item) => item.key !== tag.key))
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="entity-studio__preview-wrap">
        <button
          type="button"
          className="entity-studio__preview-toggle"
          onClick={() => setShowPreview((openPreview) => !openPreview)}
        >
          {showPreview ? "إخفاء معاينة القارئ" : "معاينة كيف سيراها القارئ"}
        </button>
        {showPreview ? (
          <div className="entity-studio__preview">
            {hasPreviewText ? (
              blocks.map((block, index) =>
                block.text.trim() ? (
                  <div key={`${block.label ?? "block"}-${index}`}>
                    {block.label ? (
                      <p className="entity-studio__preview-label">
                        {block.label}
                      </p>
                    ) : null}
                    <ArticleEntityBody text={block.text} entities={tags} />
                  </div>
                ) : null,
              )
            ) : (
              <p className="entity-studio__preview-empty">
                اكتب النص أولاً لتظهر المعاينة.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <EntityTagDialog
        open={open}
        matchText={matchText}
        onOpenChange={setOpen}
        onConfirm={(tag) => {
          onChange([...tags, tag]);
          setShowPreview(true);
          setOpen(false);
        }}
      />
    </div>
  );
}

function EntitySelectModal({
  matchText,
  onLink,
  onClose,
}: {
  matchText: string;
  onLink: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="entity-select" role="presentation">
      <button
        type="button"
        className="entity-select__backdrop"
        aria-label="إغلاق"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClose}
      />
      <div
        className="entity-select__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-select-title"
      >
        <button
          type="button"
          className="entity-select__close"
          aria-label="إغلاق"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
        <p id="entity-select-title" className="entity-select__kicker">
          المحدد
        </p>
        <blockquote className="entity-select__quote">«{matchText}»</blockquote>
        <button
          type="button"
          className="entity-select__cta"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onLink}
        >
          <Link2 className="size-4" />
          اربط هذا النص
        </button>
      </div>
    </div>,
    document.body,
  );
}

function EntityTagDialog({
  open,
  matchText,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  matchText: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (tag: LocalEntityTag) => void;
}) {
  const nameId = useId();
  const urlId = useId();
  const [query, setQuery] = useState(matchText);
  const [results, setResults] = useState<EntitySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState(matchText);
  const [linkType, setLinkType] = useState<EntityLinkType>("internal");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery(matchText);
    setName(matchText);
    setCreating(false);
    setLinkType("internal");
    setUrl("");
    setResults([]);
  }, [open, matchText]);

  useEffect(() => {
    if (!open || creating) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void Entities_APIs.search(q)
        .then((items) => {
          if (!cancelled) setResults(items);
        })
        .catch((error) => {
          if (!cancelled) {
            setResults([]);
            toast.error(getApiErrorMessage(error));
          }
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [creating, open, query]);

  const canCreate = useMemo(
    () => name.trim().length > 0 && url.trim().length > 0,
    [name, url],
  );

  const pickExisting = (item: EntitySearchResult) => {
    onConfirm({
      key: `new-${item.id}-${matchText}-${Date.now()}`,
      id: item.id,
      name: item.name,
      link_type: item.link_type,
      url: item.url,
      match_text: matchText,
    });
  };

  const createNew = () => {
    if (!canCreate) return;
    onConfirm({
      key: `create-${matchText}-${Date.now()}`,
      name: name.trim(),
      link_type: linkType,
      url: url.trim(),
      match_text: matchText,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="entity-dialog">
        <DialogHeader>
          <DialogTitle>إلى أين يشير هذا الاسم؟</DialogTitle>
          <DialogDescription>
            اختر جهة موجودة أو أنشئ وجهة جديدة. النص في العنوان أو الوصف أو
            المحتوى لن يتغيّر.
          </DialogDescription>
        </DialogHeader>

        <blockquote className="entity-dialog__clip">{matchText}</blockquote>

        {!creating ? (
          <div className="entity-dialog__search">
            <label className="entity-dialog__search-box">
              <Search className="size-4" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن جهة سبق ربطها…"
                aria-label="بحث الجهات"
              />
            </label>

            {searching ? (
              <p className="entity-dialog__status">
                <Loader2 className="size-4 animate-spin" />
                نبحث في الجهات المحفوظة
              </p>
            ) : results.length > 0 ? (
              <ul className="entity-dialog__results">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="entity-dialog__hit"
                      onClick={() => pickExisting(item)}
                    >
                      <span className="entity-dialog__hit-name">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "entity-chip__kind",
                          item.link_type === "external" &&
                            "entity-chip__kind--external",
                        )}
                      >
                        {item.link_type === "internal"
                          ? "داخل المنصة"
                          : "رابط خارجي"}
                      </span>
                      <span className="entity-dialog__hit-url" dir="ltr">
                        {item.url}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="entity-dialog__status">
                لا توجد جهة بهذا الاسم — أنشئ واحدة في ثوانٍ.
              </p>
            )}
          </div>
        ) : (
          <div className="entity-dialog__create">
            <div className="space-y-1.5">
              <Label htmlFor={nameId}>اسم الجهة</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div
              className="entity-dialog__types"
              role="radiogroup"
              aria-label="نوع الرابط"
            >
              <button
                type="button"
                role="radio"
                aria-checked={linkType === "internal"}
                className={cn(
                  "entity-dialog__type",
                  linkType === "internal" && "entity-dialog__type--on",
                )}
                onClick={() => setLinkType("internal")}
              >
                <ArrowUpLeft className="size-4" />
                <strong>داخل المنصة</strong>
                <span>صفحة أو مقال هنا</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={linkType === "external"}
                className={cn(
                  "entity-dialog__type",
                  linkType === "external" && "entity-dialog__type--on",
                )}
                onClick={() => setLinkType("external")}
              >
                <ExternalLink className="size-4" />
                <strong>رابط خارجي</strong>
                <span>يفتح في تبويب جديد</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={urlId}>
                {linkType === "internal" ? "مسار الصفحة" : "عنوان الموقع"}
              </Label>
              <Input
                id={urlId}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={
                  linkType === "internal" ? "/about" : "https://example.com"
                }
                dir="ltr"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {creating ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                رجوع للبحث
              </Button>
              <Button type="button" disabled={!canCreate} onClick={createNew}>
                تثبيت الرابط
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="button" onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                إنشاء جهة جديدة
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
