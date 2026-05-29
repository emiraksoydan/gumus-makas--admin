import { useEffect, useMemo, useState } from "react";
import {
  useSearchAdminQuery,
  type AdminSearchKind,
} from "../features/search/adminSearchApi";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;
const TABLE_SEARCH_LIMIT = 150;

/**
 * Debounced admin search for a single entity kind.
 * Returns null matchIds when query is too short (no server filter).
 */
export function useAdminSearchFilterIds(
  kind: AdminSearchKind | undefined,
  query: string,
) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const isServerFilterActive =
    !!kind && debouncedQuery.length >= MIN_QUERY_LEN;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    isSuccess,
  } = useSearchAdminQuery(
    { q: debouncedQuery, kind: kind!, limit: TABLE_SEARCH_LIMIT },
    { skip: !isServerFilterActive },
  );

  const matchIds = useMemo(() => {
    if (!isServerFilterActive) return null;
    if (!isSuccess && !data) return null;
    return new Set((data ?? []).map((r) => r.entityId));
  }, [isServerFilterActive, isSuccess, data]);

  const isSearching =
    isServerFilterActive && (isLoading || (isFetching && !matchIds));

  return {
    matchIds,
    isServerFilterActive,
    isSearching,
    isSearchError: isServerFilterActive && isError,
    debouncedQuery,
  };
}
