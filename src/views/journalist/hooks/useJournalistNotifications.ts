import JournalistNotifications_APIs from "@/services/api/journalist-notifications";
import { useQuery } from "@tanstack/react-query";

export default function useJournalistNotifications() {
  return useQuery({
    queryKey: ["journalist-notifications"],
    queryFn: async () => {
      const response = await JournalistNotifications_APIs.list();
      return response.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
