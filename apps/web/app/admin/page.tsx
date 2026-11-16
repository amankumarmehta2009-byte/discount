export default function Admin() {
  const cards = [
    ["Products", "Catalogue and variant review"],
    ["Stores", "Authorised integrations and feed status"],
    ["Coupons", "Verification, expiry and moderation"],
    ["Bank offers", "Issuer terms and eligibility"],
    ["Price history", "Feed freshness and anomalies"],
    ["Marketplace", "Seller checks, listings and disputes"]
  ];
  return <main className="adminpage">
    <a className="logo" href="/">DISCOUNT<span>.</span></a>
    <div className="eyebrow">CONTROL CENTRE</div><h1>Admin dashboard</h1>
    <div className="notice">Starter UI only. Authentication, role-based access control, audit logging and persistent admin actions must be implemented before deployment.</div>
    <div className="admincards">{cards.map(([title, desc]) => <article key={title}><h3>{title}</h3><p>{desc}</p><span className="muted small">Integration pending</span></article>)}</div>
    <a href="/">← Back to website</a>
  </main>;
}
