"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import styles from "./admin.module.css";

export type RegistrationRow = {
  id: number;
  participant_name: string;
  participant_type: string;
  age: number | null;
  guardian_name: string | null;
  phone: string;
  email: string;
  participants: number;
  amount: number;
  transaction_id: string;
  payment_status: string;
  created_at: string;
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export default function RegistrationTable({ rows }: { rows: RegistrationRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.participant_name, row.guardian_name, row.phone, row.email, row.transaction_id]
      .some((value) => String(value || "").toLowerCase().includes(term)));
  }, [query, rows]);

  return <section className={styles.panel}>
    <div className={styles.toolbar}><label><Search/><span className="sr-only">Search registrations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email or ID"/></label><strong>{filtered.length} shown</strong></div>
    {filtered.length === 0 ? <div className={styles.empty}><h2>No registrations found</h2><p>{query ? "Try another search." : "New registrations will appear here."}</p></div> : <div className={styles.tableWrap}><table>
      <thead><tr><th>Participant</th><th>Contact</th><th>Registration</th><th>Fee</th><th>Submitted</th></tr></thead>
      <tbody>{filtered.map((row) => <tr key={row.id}>
        <td><strong>{row.participant_name}</strong><span>{row.participant_type === "kid" ? `Kid${row.age ? ` · Age ${row.age}` : ""}` : "Adult"}{row.guardian_name ? ` · Guardian: ${row.guardian_name}` : ""}</span></td>
        <td><a href={`tel:+91${row.phone}`}>{row.phone}</a><a href={`mailto:${row.email}`}>{row.email}</a></td>
        <td><strong>{row.transaction_id}</strong><span>{row.participants} participant{row.participants === 1 ? "" : "s"} · {row.payment_status}</span></td>
        <td>₹{row.amount}</td><td>{displayDate(row.created_at)}</td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
