# Data integrations and accuracy rules

## Product data
Use official APIs, affiliate product feeds, written partner agreements or data providers whose terms permit the intended use. Do not assume public product pages can be scraped freely. Store provider, source URL, observation time and verification status for every listing.

## Exact product matching
Do not compare listings until the same variant is established. Match using GTIN/UPC/EAN where available, manufacturer model number, brand, storage, colour, size and key specifications. If uncertain, show "possible match" and ask for confirmation rather than presenting it as identical.

## Price history
Write a history row only after receiving a valid observation from an approved source. Never backfill invented points. Label seed/demo history as illustrative. Show last-updated timestamps and stale-feed warnings.

## Coupons and bank offers
Capture minimum spend, maximum discount, eligible card type/BIN where legally and contractually permitted, validity dates, platform, product/category scope, exclusions and terms. Do not combine offers unless the issuer's terms explicitly permit stacking. Mark unverified and expired offers clearly.

## Effective price
A safe calculation model is:
`product price + delivery fee - eligible platform discount - eligible coupon discount - eligible bank discount`.
Validate offer eligibility and stacking rules first. Do not collect card numbers or banking credentials.

## Coupon resale marketplace
Only allow coupons that the issuer explicitly permits to be transferred or resold. Require evidence and moderation. Use a compliant payment provider after merchant onboarding; do not store raw card data. Add buyer protection, refund rules, disputes, fraud monitoring and legal review.

## Chrome extension privacy
Request the minimum permissions. Process only the active supported product page when the user invokes the extension. Do not read shopping account pages, checkout fields, passwords, payment details or unrelated browsing history. Clearly disclose what page information is sent to the DISCOUNT API.
