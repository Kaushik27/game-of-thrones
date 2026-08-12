import { useSearchParams } from "react-router-dom";

export function usePageQuery(): [number, (page: number | ((current: number) => number)) => void] {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const parsed = Number(searchParameters.get("page"));
  const page = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  const setPage = (nextPage: number | ((current: number) => number)) => {
    const nextValue = typeof nextPage === "function" ? nextPage(page) : nextPage;
    const next = new URLSearchParams(searchParameters);
    if (nextValue > 0) next.set("page", String(nextValue));
    else next.delete("page");
    setSearchParameters(next, { replace: true });
  };
  return [page, setPage];
}
