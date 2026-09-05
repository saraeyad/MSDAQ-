import type { Category, PublicCategory } from "@/types";

export interface CategorySelectOption {
  id: number;
  name_ar: string;
  slug: string;
  depth: number;
  parentName?: string;
}

type CategoryTreeNode = Pick<
  Category | PublicCategory,
  "id" | "slug" | "name_ar" | "children"
>;

export function flattenCategoriesForSelect(
  tree: CategoryTreeNode[],
): CategorySelectOption[] {
  const result: CategorySelectOption[] = [];

  for (const parent of tree) {
    const children = parent.children ?? [];

    result.push({
      id: parent.id,
      name_ar: parent.name_ar,
      slug: parent.slug,
      depth: 0,
    });

    for (const child of children) {
      result.push({
        id: child.id,
        name_ar: child.name_ar,
        slug: child.slug,
        depth: 1,
        parentName: parent.name_ar,
      });
    }
  }

  return result;
}

type CategoryFilterNode = {
  id?: number | string | null;
  slug: string;
  name_ar?: string;
  children?: CategoryFilterNode[];
};

function visitCategoryTree(
  category: CategoryFilterNode,
  visit: (node: CategoryFilterNode) => void,
) {
  visit(category);
  for (const child of category.children ?? []) visitCategoryTree(child, visit);
}

function collectCategorySlugs(category: CategoryFilterNode): string[] {
  const slugs: string[] = [];
  visitCategoryTree(category, (node) => slugs.push(node.slug));
  return slugs;
}

export function buildParentSlugMap(
  tree: PublicCategory[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const parent of tree) {
    map.set(parent.slug, new Set(collectCategorySlugs(parent)));
  }
  return map;
}

/** Prefer a real id; public categories currently omit ids after hashing. */
export function categoryFilterKey(category: {
  id?: number | string | null;
  slug: string;
}): string {
  if (
    category.id != null &&
    String(category.id) !== "" &&
    String(category.id) !== "null"
  ) {
    return String(category.id);
  }
  return category.slug;
}

export function findCategoryByFilterKey<T extends CategoryFilterNode>(
  tree: T[],
  key: string,
): T | undefined {
  if (!key) return undefined;
  for (const node of tree) {
    if (categoryFilterKey(node) === key || node.slug === key) return node;
    const found = findCategoryByFilterKey((node.children ?? []) as T[], key);
    if (found) return found;
  }
  return undefined;
}

export function findParentCategory<T extends CategoryFilterNode>(
  tree: T[],
  key: string,
): T | undefined {
  if (!key) return undefined;

  for (const parent of tree) {
    if (categoryFilterKey(parent) === key || parent.slug === key) return parent;
    if (
      (parent.children ?? []).some(
        (child) => categoryFilterKey(child) === key || child.slug === key,
      )
    ) {
      return parent;
    }
  }

  return undefined;
}

export function categoryFilterLabel(
  tree: CategoryFilterNode[],
  key: string,
  fallback = "كل التصنيفات",
): string {
  if (!key) return fallback;
  return findCategoryByFilterKey(tree, key)?.name_ar ?? fallback;
}

export function collectCategoryFilterKeys(category: CategoryFilterNode): string[] {
  const keys = new Set<string>();
  visitCategoryTree(category, (node) => {
    keys.add(categoryFilterKey(node));
    keys.add(node.slug);
    if (node.id != null) keys.add(String(node.id));
  });
  keys.delete("null");
  keys.delete("undefined");
  keys.delete("");
  return [...keys];
}

function isPositiveIntegerId(id: unknown): boolean {
  if (typeof id === "number") return Number.isInteger(id) && id > 0;
  if (typeof id === "string") return /^\d+$/.test(id) && Number(id) > 0;
  return false;
}

/** Trust-index APIs validate `categories.*` as integers. */
export function collectCategoryIntegerIds(category: CategoryFilterNode): number[] {
  const ids = new Set<number>();
  visitCategoryTree(category, (node) => {
    if (isPositiveIntegerId(node.id)) ids.add(Number(node.id));
  });
  return [...ids];
}

export function countCategories(
  tree: Array<{ children?: unknown[] }>,
): number {
  let count = 0;
  for (const node of tree) {
    count += 1;
    count += countCategories(
      (node.children ?? []) as Array<{ children?: unknown[] }>,
    );
  }
  return count;
}

export interface CategoryTableRow {
  category: Category;
  isChild: boolean;
  parentId: number | null;
}

export function flattenCategoryRows(tree: Category[]): CategoryTableRow[] {
  const rows: CategoryTableRow[] = [];

  for (const parent of tree) {
    rows.push({ category: parent, isChild: false, parentId: null });
    for (const child of parent.children ?? []) {
      rows.push({ category: child, isChild: true, parentId: parent.id });
    }
  }

  return rows;
}

export function formatCategorySelectLabel(option: CategorySelectOption): string {
  if (option.depth === 0) return option.name_ar;
  return `\u2003${option.name_ar}`;
}
