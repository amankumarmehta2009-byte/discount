"use client";

import { useEffect, useMemo, useState } from "react";

type Listing = { store: string; price: number; delivery: number; url: string };
type Product = {
  id: string; name: string; brand: string; category: string; variant: string;
  demo: boolean; updated_at: string; listings: Listing[]; history: number[];
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const money = (n: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(n);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [coupon, setCoupon] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`).then(r => r.json()),
      fetch(`${API}/api/coupons`).then(r => r.json()),
      fetch(`${API}/api/bank-offers`).then(r => r.json())
    ]).then(([p, c, o]) => {
      setProducts(p.items || []); setCoupon(c.items || []); setOffers(o.items || []);
    }).catch(() => setError("Could not connect to API. Start the FastAPI server on port 8000."));
  }, []);

  const filtered = useMemo(() => products.filter(p =>
    `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())
  ), [products, query]);

  const bestPrice = (p: Product) => Math.min(...p.listings.map(l => l.price + l.delivery));

  return <main>
    <nav className="nav">
      <a className="logo" href="#">DISCOUNT<span>.</span></a>
      <div className="navlinks"><a href="#deals">Deals</a><a href="#coupons">Coupons</a><a href="#extension">Chrome Extension</a><a href="/admin">Admin</a></div>
    </nav>

    <section className="hero">
      <div className="eyebrow">SMART SHOPPING STARTS HERE</div>
      <h1>One Search.<br/><em>Every Store.</em> Best Deal.</h1>
      <p>Compare prices, check offers and make a smarter purchase — without opening ten tabs.</p>
      <div className="search">
        <span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a product, brand or model..." />
        <button onClick={() => document.getElementById("deals")?.scrollIntoView({behavior:"smooth"})}>Find deals</button>
      </div>
      <div className="trust">Price comparison <b>·</b> Price history <b>·</b> Coupons & bank offers</div>
    </section>

    <section className="section" id="deals">
      <div className="sectionhead"><div><div className="eyebrow">DISCOVER</div><h2>Popular comparisons</h2></div><span className="muted">Sample catalogue · INR</span></div>
      {error && <div className="notice">{error}</div>}
      <div className="productgrid">
        {filtered.map(p => <article className="product" key={p.id}>
          <div className="productvisual"><span className="productemoji">{p.category === "Mobiles" ? "📱" : p.category === "Laptops" ? "💻" : "🎧"}</span><span className="demo">DEMO DATA</span></div>
          <div className="productbody"><div className="muted small">{p.brand} · {p.category}</div><h3>{p.name}</h3><div className="muted small">{p.variant}</div>
            <div className="price">{money(bestPrice(p))}<span> lowest shown</span></div>
            <button className="secondary full" onClick={() => setSelected(p)}>Compare stores</button>
          </div>
        </article>)}
      </div>
      {filtered.length === 0 && !error && <p className="muted">No matching products in the demo catalogue. Try another search.</p>}
    </section>

    {selected && <section className="section detail" id="details">
      <div className="sectionhead"><div><div className="eyebrow">PRICE BREAKDOWN</div><h2>{selected.name}</h2><p className="muted">{selected.variant} · {selected.updated_at}</p></div><button className="secondary" onClick={() => setSelected(null)}>Close ×</button></div>
      <div className="tablewrap"><table><thead><tr><th>Store</th><th>Product price</th><th>Delivery</th><th>Effective price</th><th></th></tr></thead><tbody>
        {selected.listings.map(l => <tr key={l.store}><td>{l.store}</td><td>{money(l.price)}</td><td>{money(l.delivery)}</td><td><b>{money(l.price+l.delivery)}</b></td><td><a href={l.url} target="_blank" rel="noreferrer">Visit store ↗</a></td></tr>)}
      </tbody></table></div>
      <div className="notice">Variant matching and live price verification are not enabled in this demo. Confirm the exact model, colour and storage on the retailer website.</div>
      <h3 className="subhead">Illustrative price history</h3>
      <div className="history">{selected.history.map((v,i) => <div className="barcol" key={i}><div className="bar" style={{height:`${Math.max(18, v/Math.max(...selected.history)*100)}%`}}/><span>{money(v)}</span></div>)}</div>
      <p className="muted small">Demo chart only — these values are not actual historical market prices.</p>
    </section>}

    <section className="section split" id="coupons">
      <div><div className="eyebrow">EXTRA SAVINGS</div><h2>Coupons & bank offers</h2><p className="muted">See offer conditions before counting a discount. Offers are not assumed to stack.</p></div>
      <div className="offerstack">
        {coupon.map(c => <div className="offer" key={c.id}><div><b>{c.title}</b><p>{c.code} · Min. order {money(c.min_order)} · Max {money(c.max_discount)}</p></div><span className="tag">{c.status}</span></div>)}
        {offers.map(o => <div className="offer" key={o.id}><div><b>{o.bank} — {o.card}</b><p>{o.discount} · Min. transaction {money(o.min_transaction)}</p></div><span className="tag">{o.status}</span></div>)}
      </div>
    </section>

    <section className="extension" id="extension"><div className="eyebrow">SHOP WHILE YOU BROWSE</div><h2>Your deal checker,<br/>right inside the store.</h2><p>Use the DISCOUNT Chrome Extension on supported shopping product pages to check comparisons, price history and offers without copying the product link.</p><div className="extensionsteps"><span>01 · Detect product</span><span>02 · Compare stores</span><span>03 · Check real savings</span></div><p className="muted small">Extension source is included in this project. Load it unpacked from the extension folder in Chrome.</p></div>

    <footer><a className="logo" href="#">DISCOUNT<span>.</span></a><span>One Search. Every Store. Best Deal.</span><span className="muted small">Demo MVP · Verify prices and offer terms before purchase.</span></footer>
  </main>;
}
