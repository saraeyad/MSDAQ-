import { PageLoading } from "@/components/loading-spinner";
import { PublicSettings_APIs } from "@/services/api/public-pages";
import { useQuery } from "@tanstack/react-query";

interface StaticPageProps {
  pageKey: string;
  title: string;
  fallback: string;
}

export default function StaticPage({ pageKey, title, fallback }: StaticPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["static-page", pageKey],
    queryFn: async () => {
      const response = await PublicSettings_APIs.getPage(pageKey);
      return response.data.data.content;
    },
  });

  const content = data ?? fallback;

  return (
    <div className="container-page py-10">
      <h1 className="section-title">{title}</h1>
      {isLoading ? (
        <PageLoading className="mt-6" />
      ) : (
        <div
          className="prose mt-8 max-w-3xl leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
