-- Insert sample orders (using user_id instead of individual client fields)
INSERT INTO orders (order_number, user_id, adresse_livraison, status, montant_total, created_at, updated_at) VALUES
    ('ORD-2025-001', 1, '123 Main Street, Paris 75001', 'DELIVERED', 1379.98, DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP));

INSERT INTO orders (order_number, user_id, adresse_livraison, status, montant_total, created_at, updated_at) VALUES
    ('ORD-2025-002', 2, '456 Oak Avenue, Lyon 69001', 'SHIPPED', 2199.00, DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP));

INSERT INTO orders (order_number, user_id, adresse_livraison, status, montant_total, created_at, updated_at) VALUES
    ('ORD-2025-003', 3, '789 Pine Road, Marseille 13001', 'CONFIRMED', 1644.47, DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP));

INSERT INTO orders (order_number, user_id, adresse_livraison, status, montant_total, created_at, updated_at) VALUES
    ('ORD-2025-004', 4, '321 Elm Street, Toulouse 31000', 'PENDING', 699.00, DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP));

INSERT INTO orders (order_number, user_id, adresse_livraison, status, montant_total, created_at, updated_at) VALUES
    ('ORD-2025-005', 5, '654 Maple Drive, Nice 06000', 'CANCELLED', 499.99, DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP));

-- Insert order items for ORD-2025-001 (John Doe - Laptop + Mouse)
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (1, 3, 1, 1299.99, 1299.99);
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (1, 1, 1, 79.99, 79.99);

-- Insert order items for ORD-2025-002 (Alice Smith - MacBook Pro)
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (2, 4, 1, 2199.00, 2199.00);

-- Insert order items for ORD-2025-003 (Bob Martin - Multiple items)
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (3, 7, 1, 1199.00, 1199.00);
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (3, 19, 1, 249.00, 249.00);
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (3, 10, 1, 19.99, 19.99);
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (3, 2, 1, 45.50, 45.50);
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (3, 17, 1, 89.99, 89.99);

-- Insert order items for ORD-2025-004 (Emma Wilson - Google Pixel)
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (4, 9, 1, 699.00, 699.00);

-- Insert order items for ORD-2025-005 (David Brown - PlayStation 5) - CANCELLED
INSERT INTO order_items (order_id, product_id, quantity, prix_unitaire, sous_total) VALUES (5, 14, 1, 499.99, 499.99);


