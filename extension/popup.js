const statusEl = document.getElementById("status");
const productEl = document.getElementById("product");
let detected = null;

function sendToTab(tabId, message) {
  return new Promise(resolve => chrome.tabs.sendMessage(tabId, message, response => {
    if (chrome.runtime.lastError) resolve(null); else resolve(response);
  }));
}
async function init() {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  if (!tab?.id) { statusEl.textContent = "No active tab."; return; }
  detected = await sendToTab(tab.id, {type:"DISCOUNT_GET_PRODUCT"});
  if (!detected?.title) {
    statusEl.textContent = "Product not detected on this page.";
    productEl.innerHTML = `<p>Try a supported product page or use the manual search in the side panel.</p>`;
    return;
  }
  statusEl.textContent = "Product detected · " + detected.store;
  const price = detected.price ? new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(detected.price) : "Price not detected";
  productEl.innerHTML = `<h2>${escapeHtml(detected.title)}</h2><p class="price">${price}</p><p class="muted">Detection: ${escapeHtml(detected.detectionSource)} · Variant confirmation required</p><span class="pill">LIVE PAGE DETECTION</span>`;
  await chrome.storage.local.set({discountCurrentProduct: detected});
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
document.getElementById("open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (tab?.id) {
    await chrome.sidePanel.open({windowId:tab.windowId});
    chrome.runtime.sendMessage({type:"DISCOUNT_PANEL_REFRESH"});
  }
});
init();
