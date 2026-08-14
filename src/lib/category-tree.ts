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

    if (children.length === 0) {
      result.push({
        id: parent.id,
        name_ar: parent.name_ar,
        slug: parent.slug,
        depth: 0,
      });
      continue;
    }

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

export function collectCategorySlugs(category: {
  slug: string;
  children?: Array<{ slug: string }>;
}): string[] {
  const slugs = [category.slug];
  for (const child of category.children ?? []) {
    slugs.push(child.slug);
  }
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

export function findCategoryBySlug<T extends { slug: string; children?: T[] }>(
  tree: T[],
  slug: string,
): T | undefined {
  for (const node of tree) {
    if (node.slug === slug) return node;
    const found = findCategoryBySlug(node.children ?? [], slug);
    if (found) return found;
  }
  return undefined;
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
}

export function flattenCategoryRows(tree: Category[]): CategoryTableRow[] {
  const rows: CategoryTableRow[] = [];

  for (const parent of tree) {
    rows.push({ category: parent, isChild: false });
    for (const child of parent.children ?? []) {
      rows.push({ category: child, isChild: true });
    }
  }

  return rows;
}

export function formatCategorySelectLabel(option: CategorySelectOption): string {
  if (option.depth === 0) return option.name_ar;
  return `\u2003${option.name_ar}`;
}
