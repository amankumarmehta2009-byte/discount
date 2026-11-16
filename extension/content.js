(() => {
  const clean = value => (value || "").replace(/\s+/g, " ").trim();
  const meta = (name, attr = "content") =>
    document.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.getAttribute(attr) || "";

  function jsonLdProduct() {
    for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(node.textContent || "{}");
        const candidates = Array.isArray(data) ? data : [data];
        for (const item of candidates) {
          const graph = item["@graph"] || [item];
          for (const obj of graph) {
            const type = obj["@type"];
            if ((type === "Product" || (Array.isArray(type) && type.includes("Product")))) {
              const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
              return {
                title: clean(obj.name),
                brand: clean(typeof obj.brand === "string" ? obj.brand : obj.brand?.name),
                image: Array.isArray(obj.image) ? obj.image[0] : obj.image || "",
                price: Number(offers?.price || offers?.lowPrice || 0),
                currency: offers?.priceCurrency || "INR",
                sku: clean(obj.sku || obj.gtin13 || obj.gtin || ""),
                source: "schema.org"
              };
            }
          }
        }
      } catch (_) {}
    }
    return null;
  }

  function detect() {
    const structured = jsonLdProduct();
    const title = structured?.title || clean(meta("og:title")) ||
      clean(document.querySelector("h1")?.textContent) || document.title;
    const image = structured?.image || meta("og:image");
    let price = structured?.price || Number(meta("product:price:amount")) || 0;
    if (!price) {
      const candidates = [...document.querySelectorAll('[itemprop="price"],[class*="price"],[id*="price"]')].slice(0, 30);
      for (const el of candidates) {
        const raw = el.getAttribute("content") || el.textContent || "";
        const parsed = Number(raw.replace(/[^\d.]/g, ""));
        if (parsed > 0 && parsed < 10000000) { price = parsed; break; }
      }
    }
    return {
      title: clean(title).slice(0, 240),
      brand: structured?.brand || "",
      image,
      price,
      currency: structured?.currency || "INR",
      sku: structured?.sku || "",
      url: location.href,
      store: location.hostname,
      detectedAt: new Date().toISOString(),
      detectionSource: structured?.source || "page fallback",
      demo: true
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "DISCOUNT_GET_PRODUCT") {
      sendResponse(detect());
    }
  });
})();
