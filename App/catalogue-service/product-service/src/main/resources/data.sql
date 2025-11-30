-- H2 Database: product_db
-- @formatter:off

-- Insert sample products (category_id references categories in category-service microservice)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
-- Electronics (category_id: 1)
('Wireless Mouse Logitech MX', 'Ergonomic wireless mouse with precision tracking', 79.99, 50, true, 1, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI and SD card reader', 45.50, 30, true, 1, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Computers (category_id: 2)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('Laptop Dell XPS 15', 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD', 1299.99, 15, true, 2, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MacBook Pro 14"', 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', 2199.00, 10, true, 2, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gaming Desktop PC', 'AMD Ryzen 7, RTX 4070, 32GB RAM, 1TB NVMe SSD', 1799.99, 8, true, 2, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Monitor LG 27" 4K', '4K UHD IPS display with HDR support', 399.99, 20, true, 2, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Mobile Phones (category_id: 3)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('iPhone 15 Pro', '256GB, Titanium Blue, 5G enabled', 1199.00, 25, true, 3, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Samsung Galaxy S24', '256GB, Phantom Black, 5G enabled', 899.99, 30, true, 3, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Google Pixel 8', '128GB, Obsidian, 5G enabled', 699.00, 18, true, 3, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Phone Case Universal', 'Shockproof silicone case with kickstand', 19.99, 100, true, 3, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Home Appliances (category_id: 4)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('Coffee Maker Deluxe', 'Programmable coffee maker with thermal carafe', 89.99, 12, true, 4, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Air Fryer XL', '5.8 Quart digital air fryer with 8 presets', 129.99, 15, true, 4, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vacuum Cleaner Robot', 'Smart robot vacuum with mapping and app control', 349.99, 10, true, 4, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Gaming (category_id: 5)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('PlayStation 5', 'Latest generation gaming console with 825GB SSD', 499.99, 5, true, 5, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Xbox Series X', '1TB gaming console with 4K capability', 499.99, 6, true, 5, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nintendo Switch OLED', 'Portable gaming console with OLED screen', 349.99, 20, true, 5, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gaming Keyboard RGB', 'Mechanical keyboard with RGB lighting', 89.99, 25, true, 5, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Audio (category_id: 6)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('AirPods Pro 2', 'Wireless earbuds with active noise cancellation', 249.00, 40, true, 6, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 399.99, 15, true, 6, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bluetooth Speaker JBL', 'Portable waterproof speaker with 20h battery', 129.99, 30, true, 6, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Cameras (category_id: 7)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('Canon EOS R6', 'Full-frame mirrorless camera with 20MP', 2499.00, 5, true, 7, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('GoPro Hero 12', 'Action camera with 5.3K video recording', 399.99, 12, true, 7, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DJI Mini 3 Pro', 'Compact drone with 4K camera', 759.00, 8, true, 7, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Wearables (category_id: 8)
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_id, image_url, created_at, updated_at) VALUES
('Apple Watch Series 9', 'GPS + Cellular, 45mm, Sport Band', 499.00, 20, true, 8, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fitbit Charge 6', 'Fitness tracker with heart rate monitoring', 159.99, 25, true, 8, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Samsung Galaxy Watch 6', 'Smartwatch with health tracking features', 349.99, 15, true, 8, 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


