INSERT INTO shopping_platforms(name, base_url, integration_type, is_enabled) VALUES
('Amazon India','https://www.amazon.in','authorised_feed',FALSE),
('Flipkart','https://www.flipkart.com','authorised_feed',FALSE),
('Meesho','https://www.meesho.com','authorised_feed',FALSE),
('Myntra','https://www.myntra.com','authorised_feed',FALSE),
('Croma','https://www.croma.com','authorised_feed',FALSE),
('Reliance Digital','https://www.reliancedigital.in','authorised_feed',FALSE)
ON CONFLICT(name) DO NOTHING;
