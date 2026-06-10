import { errorToast } from "@/components/sonner-toast";
import { useDataTable } from "@/hooks/use-data-table";
import AdminJournalistRequests_APIs from "@/services/api/admin-journalist-requests";
import { parseJournalistRequestsListResponse } from "@/services/types/admin-journalist-requests";
import type { JournalistRequestStatus } from "@/types/journalist-requests";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import useJournalistRequestsColumns from "./use-journalist-requests-columns";

function useJournalistRequestsTable(status?: JournalistRequestStatus | "all") {
  const [globalSearch, setGlobalSearch] = useState("");
  const { columns } = useJournalistRequestsColumns();

  const { data, isLoading } = useQuery({
    queryKey: ["journalist-requests", { status }],
    queryFn: async () => {
      try {
        const params = status && status !== "all" ? { status } : undefined;
        const response = await AdminJournalistRequests_APIs.list(params);
        return parseJournalistRequestsListResponse(response.data);
      } catch (error) {
        errorToast(error instanceof Error ? error.message : "Failed to load requests");
        return [];
      }
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    const rows = data ?? [];
    if (!globalSearch) return rows;
    const query = globalSearch.toLowerCase();
    return rows.filter(
      (row) =>
        row.applicantName.toLowerCase().includes(query) ||
        row.applicantEmail.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query),
    );
  }, [data, globalSearch]);

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / 10) || 1,
    manualPagination: true,
    manualFiltering: true,
  });

  return { table, isLoading, globalSearch, setGlobalSearch };
}

export default useJournalistRequestsTable;
