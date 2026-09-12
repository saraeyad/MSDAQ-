import { PublicCategories_APIs } from "@/services/api/public-categories";
import { useQuery } from "@tanstack/react-query";

export function usePublicCategories() {
  return useQuery({
    queryKey: ["public-categories"],
    queryFn: () => PublicCategories_APIs.list(),
    staleTime: 5 * 60_000,
  });
}
