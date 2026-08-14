import { CategoryFeedView } from "@/features/public-site/categories/CategoryFeedView";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useSiteOrigin } from "@/context/site-origin";
import { findCategoryBySlug } from "@/lib/category-tree";
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
  const { data: categories = [] } = usePublicCategories();

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const cachedCategory = useMemo(
    () => findCategoryBySlug(categories, slug ?? ""),
    [categories, slug],
  );

  const parentCategory = useMemo(() => {
    if (!slug) return undefined;
    for (const parent of categories) {
      if (parent.slug === slug) return parent;
      if (parent.children?.some((child) => child.slug === slug)) {
        return parent;
      }
    }
    return undefined;
  }, [categories, slug]);

  const subcategoryLinks = useMemo(() => {
    if (!parentCategory?.children?.length) return [];
    return parentCategory.children.map((child) => ({
      slug: child.slug,
      label: child.name_ar,
    }));
  }, [parentCategory]);

  const activeSubcategorySlug = parentCategory?.children?.some(
    (child) => child.slug === slug,
  )
    ? slug
    : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-category", slug, page],
    queryFn: () => PublicCategories_APIs.getBySlug(slug!, page),
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
        <h1 className="font-headline text-2xl font-bold">القسم غير موجود</h1>
        <p className="mt-3 text-muted-foreground">
          لم نعثر على هذا القسم. تحقق من الرابط أو عد إلى الصفحة الرئيسية.
        </p>
      </div>
    );
  }

  const category = data?.category ?? cachedCategory;
  const categoryName = category?.name_ar;
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
        badge={categoryName ?? ""}
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
            ? `لا يوجد محتوى في «${categoryName}»`
            : "لا يوجد محتوى في هذا القسم"
        }
        emptyDescription="تابعنا للاطلاع على المحتوى القادم في هذا القسم."
      />
    </>
  );
}
