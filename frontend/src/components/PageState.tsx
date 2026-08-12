export default function PageState({ loading, error, empty = false }: { loading: boolean; error: string; empty?: boolean }) {
  if (error) return <div className="notice error" role="alert"><strong>The API did not answer.</strong><span>{error} Make sure the Spring Boot application is running on port 8080.</span></div>;
  if (loading) return <div className="notice" role="status"><span className="loader" />Loading records from H2 through the API…</div>;
  if (empty) return <div className="notice">No database records match this view.</div>;
  return null;
}
