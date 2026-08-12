import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiTrace } from "../types";

export default function ApiJourney() {
  const [trace, setTrace] = useState<ApiTrace>();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const listener = (event: Event) => setTrace((event as CustomEvent<ApiTrace>).detail);
    window.addEventListener("realm:api-trace", listener);
    return () => window.removeEventListener("realm:api-trace", listener);
  }, []);
  return <aside className={`api-journey${open ? " open" : ""}`} aria-label="Live request journey">
    <button className="api-journey-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>
      <span className={`pulse ${trace?.state || "idle"}`} /> How did this page get its data?
    </button>
    {open && <div className="api-journey-body">
      <p className="eyebrow">LIVE REQUEST TRACE</p>
      <code>{trace ? `${trace.method} ${trace.path}` : "Browse a page to send an API request"}</code>
      <div className="journey-steps"><span>① React</span><b>→</b><span>② REST controller</span><b>→</b><span>③ Service</span><b>→</b><span>④ Repository</span><b>→</b><span>⑤ H2</span></div>
      {trace && <p className="trace-result">{trace.state === "loading" ? "Request in flight…" : `${trace.status || "Network error"} · ${trace.durationMs ?? 0} ms · ${trace.database || "No database header"}`}</p>}
      <Link to="/architecture">Learn what every layer does →</Link>
    </div>}
  </aside>;
}
