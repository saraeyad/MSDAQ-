import { errorToast } from "@/components/sonner-toast";
import { useDataTable } from "@/hooks/use-data-table";
import JournalistArticles_APIs from "@/services/api/journalist-articles";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import useAdminArticlesColumns from "./use-admin-articles-columns";

function useAdminArticlesTable() {
  const [globalSearch, setGlobalSearch] = useState("");
  const { columns } = useAdminArticlesColumns();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pending-articles"],
    queryFn: async () => {
      return JournalistArticles_APIs.adminListPending()
        .then((res) => {
          if (res.data.error) throw new Error(res.data.message);
          return res.data.data ?? [];
        })
        .catch((err) => {
          errorToast(err.message);
          return [];
        });
    },
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    const rows = data ?? [];
    if (!globalSearch) return rows;
    return rows.filter((row) =>
      row.title.toLowerCase().includes(globalSearch.toLowerCase())
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

export default useAdminArticlesTable;
