CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_currency CHAR(3) NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shopping_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  base_url TEXT,
  integration_type TEXT NOT NULL DEFAULT 'manual',
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT,
  gtin TEXT,
  model_number TEXT,
  data_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  colour TEXT,
  storage TEXT,
  size TEXT,
  specifications JSONB NOT NULL DEFAULT '{}',
  variant_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES shopping_platforms(id),
  external_product_id TEXT,
  product_url TEXT NOT NULL,
  price NUMERIC(12,2) CHECK (price >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  availability TEXT NOT NULL DEFAULT 'unknown',
  verified_at TIMESTAMPTZ,
  source_type TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform_id, external_product_id)
);
CREATE INDEX idx_listing_variant ON product_listings(product_variant_id);
CREATE INDEX idx_listing_verified ON product_listings(verified_at DESC);

CREATE TABLE price_history (
  id BIGSERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES product_listings(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_type TEXT NOT NULL DEFAULT 'demo'
);
CREATE INDEX idx_price_history_listing_time ON price_history(listing_id, observed_at DESC);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES shopping_platforms(id),
  code TEXT,
  title TEXT NOT NULL,
  discount_type TEXT,
  discount_value NUMERIC(12,2),
  min_order NUMERIC(12,2) DEFAULT 0,
  max_discount NUMERIC(12,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  terms TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bank_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES shopping_platforms(id),
  bank_name TEXT NOT NULL,
  card_type TEXT,
  offer_type TEXT,
  discount_value NUMERIC(12,2),
  min_transaction NUMERIC(12,2),
  max_discount NUMERIC(12,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  terms TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
);

CREATE TABLE offer_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_offer_id UUID NOT NULL REFERENCES bank_offers(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  category TEXT,
  eligibility_rules JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_variant_id)
);

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  target_price NUMERIC(12,2) NOT NULL CHECK (target_price > 0),
  status TEXT NOT NULL DEFAULT 'active',
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  verification_status TEXT NOT NULL DEFAULT 'pending',
  payout_provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES marketplace_sellers(id),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  asking_price NUMERIC(12,2) NOT NULL CHECK (asking_price >= 0),
  transferability_evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  buyer_user_id UUID NOT NULL REFERENCES users(id),
  order_status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id),
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id),
  opened_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE affiliate_clicks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES product_listings(id) ON DELETE SET NULL,
  click_ref TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','moderator','analyst')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
