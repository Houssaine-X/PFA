-- H2 Database: user_db
-- @formatter:off

-- Insert sample users (password should be hashed in production)
INSERT INTO users (email, first_name, last_name, password, phone_number, address, role, active, created_at, updated_at) VALUES
('admin@catalogue.com', 'Admin', 'User', 'admin123', '+1234567890', '123 Admin Street, City', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('john.doe@example.com', 'John', 'Doe', 'password123', '+1234567891', '456 Client Avenue, City', 'CLIENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('jane.smith@example.com', 'Jane', 'Smith', 'password123', '+1234567892', '789 Customer Road, City', 'CLIENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bob.wilson@example.com', 'Bob', 'Wilson', 'password123', '+1234567893', '321 Buyer Lane, City', 'CLIENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('alice.brown@example.com', 'Alice', 'Brown', 'password123', '+1234567894', '654 Shopper Street, City', 'CLIENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('superadmin@catalogue.com', 'Super', 'Admin', 'super123', '+1234567895', '999 Admin Plaza, City', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- @formatter:on

