const API = DISCOUNT_API_BASE;
const content = document.getElementById("content");
let product = null;
let activeTab = "compare";
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function api(path) { const r = await fetch(API+path); if(!r.ok) throw new Error("API unavailable"); return r.json(); }

async function loadCurrent() {
  const stored = await chrome.storage.local.get("discountCurrentProduct");
  product = stored.discountCurrentProduct || null;
  if (!product) { content.innerHTML = `<p>No detected product yet. Open a supported product page, then reopen this panel.</p>`; return; }
  render();
}
async function render() {
  if (!product) return;
  if (activeTab === "compare") {
    const catalogue = await api("/api/products").catch(()=>({items:[]}));
    const match = (catalogue.items||[]).find(p => p.name.toLowerCase() === (product.title||"").toLowerCase());
    if (!match) {
      content.innerHTML = `<h2>${esc(product.title)}</h2><p>${product.price ? money(product.price) : "Price not detected"} on current page</p><div class="warning">No exact catalogue match. DISCOUNT will not compare unrelated products.</div><p>Use manual search below, or connect an authorised product matching provider.</p>`;
      return;
    }
    const result = await api("/api/compare/"+match.id);
    content.innerHTML = `<h2>${esc(match.name)}</h2><p class="warning">DEMO DATA — not live prices</p>` +
      result.listings.map(l=>`<div class="listing"><b>${esc(l.store)}</b><strong>${money(l.price+l.delivery)}</strong></div>`).join("");
  } else if (activeTab === "history") {
    content.innerHTML = `<h3>Price history</h3><p class="warning">Historical chart values are illustrative demo data.</p><p>Exact product matching is required before showing a real history chart.</p>`;
  } else {
    const [c,o] = await Promise.all([api("/api/coupons"),api("/api/bank-offers")]);
    content.innerHTML = `<h3>Coupons</h3>`+(c.items||[]).map(x=>`<div class="listing"><b>${esc(x.code)}</b><span>${esc(x.status)}</span></div>`).join("")+
      `<h3>Bank offers</h3>`+(o.items||[]).map(x=>`<div class="listing"><b>${esc(x.bank)}</b><span>${esc(x.status)}</span></div>`).join("");
  }
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); activeTab=b.dataset.tab; render().catch(showError);
}));
function showError(){content.innerHTML=`<div class="warning">Could not reach the DISCOUNT API. Start the backend at ${esc(API)}.</div>`;}
document.getElementById("searchBtn").addEventListener("click", async()=>{
  const q=document.getElementById("search").value.trim();
  if(!q) return;
  const data=await api("/api/products?q="+encodeURIComponent(q)).catch(()=>({items:[]}));
  document.getElementById("results").innerHTML=(data.items||[]).map(p=>`<button class="result" data-id="${esc(p.id)}">${esc(p.name)} · DEMO</button>`).join("") || "<p>No catalogue matches.</p>";
  document.querySelectorAll(".result").forEach(b=>b.addEventListener("click",async()=>{
    const p=await api("/api/products/"+b.dataset.id); product={title:p.name,price:0}; await chrome.storage.local.set({discountCurrentProduct:product}); activeTab="compare"; render().catch(showError);
  }));
});
loadCurrent().catch(showError);
