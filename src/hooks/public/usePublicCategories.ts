import { PublicCategories_APIs } from "@/services/api/public-categories";
import { useLocale } from "@/context/locale";
import { useQuery } from "@tanstack/react-query";

export function usePublicCategories() {
  const { locale } = useLocale();

  return useQuery({
    queryKey: ["public-categories", locale],
    queryFn: () => PublicCategories_APIs.list(),
    staleTime: 5 * 60_000,
  });
}
