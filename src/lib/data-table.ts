import type { Column } from "@tanstack/react-table";

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
  isHeader = false,
  isCell = false,
}: {
  column: Column<TData>;
  withBorder?: boolean;
  isHeader?: boolean;
  isCell?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
        ? "4px 0 4px -4px hsl(var(--border)) inset"
        : undefined
      : undefined,
    insetInlineStart:
      isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    insetInlineEnd:
      isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor:
      isPinned && !isHeader
        ? "var(--card)"
        : isCell
          ? "var(--card)"
          : "var(--muted)",
  };
}

