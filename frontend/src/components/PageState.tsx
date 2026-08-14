export default function PageState({ loading, error, empty = false, onRetry }: { loading: boolean; error: string; empty?: boolean; onRetry?: () => void }) {
  if (error) return <div className="notice error" role="alert" aria-live="assertive"><strong>The realm service did not answer.</strong><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Try again</button>}</div>;
  if (loading) return <div className="notice" role="status" aria-busy="true"><span className="loader" />Loading records from the realm service…</div>;
  if (empty) return <div className="notice" role="status">No records match this view.</div>;
  return null;
}
