import { CategoryFeedView } from "@/features/public-site/categories/CategoryFeedView";
import { useLocale, usePublicCopy } from "@/context/locale";
import { usePublicCategories } from "@/hooks/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useSiteOrigin } from "@/context/site-origin";
import {
  findCategoryByFilterKey,
  findParentCategory,
} from "@/lib/publishing";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import {
  buildCategoryJsonLd,
  buildCategorySeoHead,
} from "@/lib/seo/category-seo";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type { PublicCategoryDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/router/routes";

interface CategoryPageProps {
  initialData?: PublicCategoryDetail;
  initialPage?: number;
}

export default function CategoryPage({
  initialData,
  initialPage = 1,
}: CategoryPageProps) {
  const origin = useSiteOrigin();
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(initialPage);
  const { locale } = useLocale();
  const { categories: categoriesCopy } = usePublicCopy();
  const { data: categories = [] } = usePublicCategories();

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const cachedCategory = useMemo(
    () => findCategoryByFilterKey(categories, slug ?? ""),
    [categories, slug],
  );

  const parentCategory = useMemo(
    () => findParentCategory(categories, slug ?? ""),
    [categories, slug],
  );

  const subcategoryLinks = useMemo(() => {
    if (!parentCategory?.children?.length) return [];
    return parentCategory.children.map((child) => ({
      slug: child.slug,
      label: localizedCategoryName(child, locale),
    }));
  }, [parentCategory, locale]);

  const activeSubcategorySlug = parentCategory?.children?.some(
    (child) => child.slug === slug,
  )
    ? slug
    : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-category", locale, slug, page],
    queryFn: () => PublicCategories_APIs.getBySlug(slug!, page, locale),
    enabled: Boolean(slug),
    initialData: page === initialPage ? initialData : undefined,
    retry: false,
  });

  if (!slug) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (isError && !data) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-headline text-2xl font-bold">
          {categoriesCopy.notFoundTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {categoriesCopy.notFoundLead}
        </p>
      </div>
    );
  }

  const category = data?.category ?? cachedCategory;
  const categoryName = category
    ? localizedCategoryName(category, locale)
    : undefined;
  const pagination = data?.pagination;
  const seoHead = category
    ? buildCategorySeoHead(category, { page, origin, pagination })
    : null;
  const jsonLd = category ? buildCategoryJsonLd(category, origin) : null;
  const headerLoading = !categoryName && isLoading && !data;

  return (
    <>
      {seoHead ? <PublicPageHead head={seoHead} /> : null}
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <CategoryFeedView
        title={categoryName ?? ""}
        headerLoading={headerLoading}
        description={category?.description}
        subcategoryLinks={subcategoryLinks}
        activeSubcategorySlug={activeSubcategorySlug}
        articles={data?.articles ?? []}
        pagination={pagination}
        isLoading={isLoading && !data}
        page={page}
        onPageChange={setPage}
        emptyTitle={
          categoryName
            ? categoriesCopy.emptyInSection(categoryName)
            : categoriesCopy.emptySectionTitle
        }
        emptyDescription={categoriesCopy.emptySectionDescription}
      />
    </>
  );
}
