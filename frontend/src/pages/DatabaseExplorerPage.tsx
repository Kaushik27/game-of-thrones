import { useEffect, useState } from "react";
import { getDatabaseRecords, getDatabaseTables } from "../api";
import PageState from "../components/PageState";
import { useResource } from "../hooks/useResource";
import type { DatabaseTable } from "../types";

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function DatabaseExplorerPage() {
  const tables = useResource(signal => getDatabaseTables(signal), []);
  const [selected, setSelected] = useState<DatabaseTable>();
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (!selected && tables.data?.items.length) setSelected(tables.data.items[0]);
  }, [tables.data, selected]);
  const records = useResource(signal => selected ? getDatabaseRecords(selected.name, page, 8, signal) : Promise.resolve(undefined), [selected?.name, page]);

  return <main className="page database-page">
    <div className="page-hero"><p className="eyebrow">READ-ONLY DATA ACCESS</p><h1>Database explorer</h1><p>Inspect the hosted H2 database through a safe, allowlisted API. React never receives credentials or arbitrary SQL access.</p></div>
    <section className="database-flow" aria-label="Database request flow"><span>Database table</span><b>→</b><span>Repository</span><b>→</b><span>Service</span><b>→</b><span>REST JSON</span><b>→</b><span>React table</span></section>
    <PageState loading={tables.loading} error={tables.error}/>
    {tables.data && <>
      <section className="database-table-list"><div className="section-heading"><div><p className="eyebrow">SCHEMA CATALOG</p><h2>{tables.data.itemsCount} allowlisted tables</h2></div><p>GET /api/v1/database/tables</p></div><div className="database-table-buttons">{tables.data.items.map(table => <button className={selected?.name === table.name ? "selected" : ""} key={table.name} onClick={() => { setSelected(table); setPage(0); }}><strong>{table.displayName}</strong><span>{table.name} · {table.recordCount} records</span></button>)}</div></section>
      {selected && <section className="database-records"><div className="section-heading"><div><p className="eyebrow">{selected.displayName.toUpperCase()} TABLE</p><h2>Rows from H2</h2></div><p>GET /api/v1/database/tables/{selected.name}/records</p></div><div className="column-chips">{selected.columns.map(column => <span key={column.name}><strong>{column.name}</strong> {column.type}</span>)}</div><PageState loading={records.loading} error={records.error} empty={!records.loading && !records.data?.items.length}/>{records.data && <><div className="database-grid-wrap"><table className="database-grid"><thead><tr>{selected.columns.map(column => <th key={column.name}>{column.name}<small>{column.type}</small></th>)}</tr></thead><tbody>{records.data.items.map((record, index) => <tr key={String(record.id ?? index)}>{selected.columns.map(column => <td title={formatValue(record[column.name])} key={column.name}>{formatValue(record[column.name])}</td>)}</tr>)}</tbody></table></div><div className="pagination"><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {records.data.page + 1} of {Math.max(records.data.pagesCount, 1)} · {records.data.itemsCount} records</span><button disabled={page + 1 >= records.data.pagesCount} onClick={() => setPage(value => value + 1)}>Next</button></div></>}</section>}
    </>}
  </main>;
}
