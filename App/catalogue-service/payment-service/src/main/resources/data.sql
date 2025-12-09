-- H2 Database: payment_db
-- @formatter:off

-- Insert sample payments
INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id, description, created_at, updated_at) VALUES
(1, 1, 159.98, 'CREDIT_CARD', 'COMPLETED', 'TXN-001-2024', 'Payment for order #1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 29.99, 'PAYPAL', 'COMPLETED', 'TXN-002-2024', 'Payment for order #2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 89.99, 'CREDIT_CARD', 'PENDING', 'TXN-003-2024', 'Payment for order #3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 199.99, 'CREDIT_CARD', 'COMPLETED', 'TXN-004-2024', 'Payment for order #4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 49.99, 'BANK_TRANSFER', 'PROCESSING', 'TXN-005-2024', 'Payment for order #5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- @formatter:on

