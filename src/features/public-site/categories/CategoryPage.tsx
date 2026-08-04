import { CategoryFeedView } from "@/features/public-site/categories/CategoryFeedView";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { JsonLd } from "@/lib/seo/JsonLd";
import { PublicPageHead } from "@/lib/seo/PublicPageHead";
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
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(initialPage);
  const { data: categories = [] } = usePublicCategories();

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const cachedCategory = useMemo(
    () => categories.find((category) => category.slug === slug),
    [categories, slug],
  );

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
  const seo = category?.seo;
  const seoHead = seo ? buildCategorySeoHead(seo) : null;
  const jsonLd = seo ? buildCategoryJsonLd(seo) : null;
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
        articles={data?.articles ?? []}
        pagination={data?.pagination}
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
