-- H2 Database: product_db
-- @formatter:off

-- Insert sample products with embedded category information
INSERT INTO products (nom, description, prix, stock_quantity, disponible, category_name, category_description, image_url, created_at, updated_at) VALUES
-- Electronics
('Wireless Mouse Logitech MX', 'Ergonomic wireless mouse with precision tracking', 79.99, 50, true, 'Electronics', 'Electronic devices and accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI and SD card reader', 45.50, 30, true, 'Electronics', 'Electronic devices and accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Computers
('Laptop Dell XPS 15', 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD', 1299.99, 15, true, 'Computers', 'Laptops, desktops, and computer accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MacBook Pro 14"', 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', 2199.00, 10, true, 'Computers', 'Laptops, desktops, and computer accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Gaming Desktop PC', 'AMD Ryzen 7, RTX 4070, 32GB RAM, 1TB NVMe SSD', 1799.99, 8, true, 'Computers', 'Laptops, desktops, and computer accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Monitor LG 27" 4K', '4K UHD IPS display with HDR support', 399.99, 20, true, 'Computers', 'Laptops, desktops, and computer accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mobile Phones
('iPhone 15 Pro', '256GB, Titanium Blue, 5G enabled', 1199.00, 25, true, 'Mobile Phones', 'Smartphones and mobile accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Samsung Galaxy S24', '256GB, Phantom Black, 5G enabled', 899.99, 30, true, 'Mobile Phones', 'Smartphones and mobile accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Google Pixel 8', '128GB, Obsidian, 5G enabled', 699.00, 18, true, 'Mobile Phones', 'Smartphones and mobile accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Phone Case Universal', 'Shockproof silicone case with kickstand', 19.99, 100, true, 'Mobile Phones', 'Smartphones and mobile accessories', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Home Appliances
('Coffee Maker Deluxe', 'Programmable coffee maker with thermal carafe', 89.99, 12, true, 'Home Appliances', 'Kitchen and home appliances', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Air Fryer XL', '5.8 Quart digital air fryer with 8 presets', 129.99, 15, true, 'Home Appliances', 'Kitchen and home appliances', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vacuum Cleaner Robot', 'Smart robot vacuum with mapping and app control', 349.99, 10, true, 'Home Appliances', 'Kitchen and home appliances', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Gaming
('PlayStation 5 Console', 'Next-gen gaming console with 825GB SSD', 499.99, 5, true, 'Gaming', 'Gaming consoles and video games', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Xbox Series X', 'Powerful gaming console with 1TB SSD', 499.99, 7, true, 'Gaming', 'Gaming consoles and video games', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nintendo Switch OLED', 'Portable gaming console with OLED screen', 349.99, 12, true, 'Gaming', 'Gaming consoles and video games', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Audio
('Sony WH-1000XM5', 'Premium noise-cancelling wireless headphones', 399.99, 20, true, 'Audio', 'Headphones, speakers, and audio equipment', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Bluetooth Speaker JBL', 'Portable waterproof speaker with 20hr battery', 149.99, 25, true, 'Audio', 'Headphones, speakers, and audio equipment', 'https://via.placeholder.com/150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- @formatter:on

