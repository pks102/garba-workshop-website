import { env } from "cloudflare:workers";
import { Download, LogOut } from "lucide-react";
import { headers } from "next/headers";
import { googleClientId, verifyAdminSession } from "@/lib/admin-auth";
import RegistrationTable, { type RegistrationRow } from "./registration-table";
import GoogleSignIn from "./google-sign-in";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const session = await verifyAdminSession(requestHeaders.get("cookie"));

  if (!session) {
    const clientId = googleClientId();
    return <main className={styles.shell}><section className={styles.denied}>
      <span>Joy Kids Care</span><h1>Admin sign in</h1>
      <p>Sign in with the authorised Google account to view registrations.</p>
      {clientId ? <GoogleSignIn clientId={clientId}/> : <p className={styles.setup}>Google sign-in is being connected. Please check again shortly.</p>}
      <small>Access is restricted to approved Google accounts.</small>
    </section></main>;
  }

  const result = await (env.DB as D1Database).prepare(
    "SELECT id, participant_name, participant_type, age, guardian_name, phone, email, participants, amount, transaction_id, payment_status, created_at FROM registrations ORDER BY created_at DESC LIMIT 2000",
  ).all<RegistrationRow>();

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><span>Joy Kids Care</span><h1>Garba registrations</h1><p>{result.results.length} registered participant {result.results.length === 1 ? "entry" : "entries"}</p></div>
      <nav><a className={styles.download} href="/api/export"><Download/> Download Excel</a><form action="/api/auth/logout" method="post"><button className={styles.logout} type="submit"><LogOut/> Sign out</button></form></nav>
    </header>
    <RegistrationTable rows={result.results}/>
  </main>;
}
