# API quick reference

Base URL (local): `http://localhost:8000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API health |
| GET | `/api/products?q=phone` | Search demo catalogue |
| GET | `/api/products/{id}` | Product details |
| GET | `/api/compare/{id}` | Sort listings by effective price |
| GET | `/api/products/{id}/history` | Demo price history points |
| GET | `/api/coupons` | Demo coupons |
| GET | `/api/bank-offers` | Demo bank offers |
| POST | `/api/calculate` | Calculate indicative final price |
| POST | `/api/alerts` | Alert endpoint placeholder |

Interactive OpenAPI docs: `/docs`.

Example calculator request:

```json
{
  "product_price": 25000,
  "delivery": 0,
  "coupon_discount": 500,
  "bank_discount": 1000
}
```
