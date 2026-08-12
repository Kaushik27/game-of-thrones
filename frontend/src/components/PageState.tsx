export default function PageState({ loading, error, empty = false, onRetry }: { loading: boolean; error: string; empty?: boolean; onRetry?: () => void }) {
  if (error) return <div className="notice error" role="alert"><strong>The API did not answer.</strong><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Try again</button>}</div>;
  if (loading) return <div className="notice" role="status"><span className="loader" />Loading records from H2 through the API…</div>;
  if (empty) return <div className="notice">No database records match this view.</div>;
  return null;
}
