-- =====================================================
-- MOCK DATA FOR TESTING - MeriDukanSaPlayer
-- Run this SQL in Supabase SQL Editor after schema setup
-- =====================================================

-- =====================================================
-- 1. ADDITIONAL TEST VENDORS (USERS)
-- =====================================================
INSERT INTO users (partner_id, username, password, name, email, phone, address, wallet_balance, role)
VALUES 
    ('VND002', 'vendor2', 'vendor123', 'Fashion Store India', 'fashion@test.com', '9876543211', '456 Fashion Street, Mumbai, MH', 15000, 'partner'),
    ('VND003', 'vendor3', 'vendor123', 'Electronics Hub', 'electronics@test.com', '9876543212', '789 Tech Park, Bangalore, KA', 25000, 'partner'),
    ('VND004', 'vendor4', 'vendor123', 'Home Decor Shop', 'home@test.com', '9876543213', '321 Home Lane, Delhi, DL', 8000, 'partner'),
    ('VND005', 'vendor5', 'vendor123', 'Sports World', 'sports@test.com', '9876543214', '654 Sports Complex, Chennai, TN', 12000, 'partner'),
    ('VND006', 'vendor6', 'vendor123', 'Beauty Essentials', 'beauty@test.com', '9876543215', '987 Glamour Road, Kolkata, WB', 9500, 'partner')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 2. SAMPLE PRODUCTS
-- =====================================================
INSERT INTO products (name, sku, price, mrp, description, category, stock, weight_kg, is_active)
VALUES 
    ('Wireless Bluetooth Earbuds', 'ELEC001', 200, 999, 'High quality wireless earbuds with noise cancellation', 'Electronics', 150, 0.2, true),
    ('Cotton T-Shirt (Men)', 'FASH001', 150, 599, 'Premium cotton t-shirt, multiple colors', 'Fashion', 500, 0.3, true),
    ('Women Kurta Set', 'FASH002', 350, 1299, 'Designer kurta with palazzo', 'Fashion', 200, 0.5, true),
    ('Smartphone Stand', 'ELEC002', 80, 299, 'Adjustable mobile phone holder', 'Electronics', 300, 0.15, true),
    ('LED Table Lamp', 'HOME001', 180, 799, 'Touch control desk lamp with USB', 'Home Decor', 100, 0.5, true),
    ('Yoga Mat', 'SPRT001', 120, 499, 'Anti-slip yoga mat, 6mm thick', 'Sports', 250, 1.2, true),
    ('Face Serum', 'BEAU001', 280, 899, 'Vitamin C face serum, 30ml', 'Beauty', 400, 0.1, true),
    ('Running Shoes', 'SPRT002', 450, 1999, 'Lightweight running shoes', 'Sports', 180, 0.8, true),
    ('Wall Clock', 'HOME002', 220, 699, 'Modern wall clock with silent mechanism', 'Home Decor', 90, 0.6, true),
    ('Wireless Mouse', 'ELEC003', 150, 599, 'Ergonomic wireless mouse', 'Electronics', 220, 0.12, true),
    ('Cotton Saree', 'FASH003', 400, 1499, 'Handloom cotton saree', 'Fashion', 120, 0.4, true),
    ('Lipstick Set', 'BEAU002', 180, 699, 'Matte lipstick combo pack (3 shades)', 'Beauty', 350, 0.15, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. SAMPLE ORDERS - Mix of Delivered, RTO, Pending
-- =====================================================

-- Helper function to generate order data
-- Orders for VND001 (Demo Partner)
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered Orders for VND001
    ('ORD-VND001-001', 'VND001_ORD_001', 'VND001', 'Demo Partner', 'Rahul Sharma', '9876500001', '123 Main St, Andheri West', '400053', 'Mumbai', 'Maharashtra', 'MH', '[{"name": "Wireless Bluetooth Earbuds", "price": 200, "quantity": 1}]', 899, 899, 583, 'cod', 'delivered', 'TRK001', NOW() - INTERVAL '15 days'),
    ('ORD-VND001-002', 'VND001_ORD_002', 'VND001', 'Demo Partner', 'Priya Patel', '9876500002', '456 Park Lane, Borivali', '400066', 'Mumbai', 'Maharashtra', 'MH', '[{"name": "Cotton T-Shirt (Men)", "price": 150, "quantity": 2}]', 799, 799, 483, 'prepaid', 'delivered', 'TRK002', NOW() - INTERVAL '12 days'),
    ('ORD-VND001-003', 'VND001_ORD_003', 'VND001', 'Demo Partner', 'Amit Kumar', '9876500003', '789 Model Town, Sector 12', '201301', 'Noida', 'Uttar Pradesh', 'UP', '[{"name": "LED Table Lamp", "price": 180, "quantity": 1}]', 799, 799, 487, 'cod', 'delivered', 'TRK003', NOW() - INTERVAL '10 days'),
    -- RTO Orders for VND001
    ('ORD-VND001-004', 'VND001_ORD_004', 'VND001', 'Demo Partner', 'Fake Customer', '9876500004', '111 Unknown St, Remote Area', '110001', 'Delhi', 'Delhi', 'DL', '[{"name": "Wireless Mouse", "price": 150, "quantity": 1}]', 599, 599, 0, 'cod', 'rto', 'TRK004', NOW() - INTERVAL '8 days'),
    -- Pending Orders for VND001
    ('ORD-VND001-005', 'VND001_ORD_005', 'VND001', 'Demo Partner', 'Sneha Reddy', '9876500005', '222 IT Park, Hitech City', '500081', 'Hyderabad', 'Telangana', 'TG', '[{"name": "Face Serum", "price": 280, "quantity": 1}]', 899, 899, 0, 'prepaid', 'pending', NULL, NOW() - INTERVAL '2 days');

-- Orders for VND002 (Fashion Store India)
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered Orders
    ('ORD-VND002-001', 'VND002_ORD_001', 'VND002', 'Fashion Store India', 'Meera Joshi', '9876600001', '101 Fashion St, Vile Parle', '400057', 'Mumbai', 'Maharashtra', 'MH', '[{"name": "Women Kurta Set", "price": 350, "quantity": 1}]', 1299, 1299, 867, 'cod', 'delivered', 'TRK101', NOW() - INTERVAL '20 days'),
    ('ORD-VND002-002', 'VND002_ORD_002', 'VND002', 'Fashion Store India', 'Kavita Singh', '9876600002', '202 Silk Road, Connaught Place', '110001', 'New Delhi', 'Delhi', 'DL', '[{"name": "Cotton Saree", "price": 400, "quantity": 1}]', 1499, 1499, 1027, 'prepaid', 'delivered', 'TRK102', NOW() - INTERVAL '18 days'),
    ('ORD-VND002-003', 'VND002_ORD_003', 'VND002', 'Fashion Store India', 'Anjali Verma', '9876600003', '303 MG Road, Koramangala', '560034', 'Bangalore', 'Karnataka', 'KA', '[{"name": "Cotton T-Shirt (Men)", "price": 150, "quantity": 3}]', 999, 999, 525, 'cod', 'delivered', 'TRK103', NOW() - INTERVAL '14 days'),
    ('ORD-VND002-004', 'VND002_ORD_004', 'VND002', 'Fashion Store India', 'Rekha Agarwal', '9876600004', '404 Civil Lines', '302001', 'Jaipur', 'Rajasthan', 'RJ', '[{"name": "Women Kurta Set", "price": 350, "quantity": 2}]', 2199, 2199, 1419, 'prepaid', 'delivered', 'TRK104', NOW() - INTERVAL '11 days'),
    -- RTO Orders  
    ('ORD-VND002-005', 'VND002_ORD_005', 'VND002', 'Fashion Store India', 'Wrong Address', '9876600005', '999 Fake Lane', '400001', 'Mumbai', 'Maharashtra', 'MH', '[{"name": "Cotton Saree", "price": 400, "quantity": 1}]', 1499, 1499, 0, 'cod', 'rto', 'TRK105', NOW() - INTERVAL '9 days'),
    ('ORD-VND002-006', 'VND002_ORD_006', 'VND002', 'Fashion Store India', 'Refused Delivery', '9876600006', '888 Lane', '110002', 'Delhi', 'Delhi', 'DL', '[{"name": "Women Kurta Set", "price": 350, "quantity": 1}]', 1299, 1299, 0, 'cod', 'rto', 'TRK106', NOW() - INTERVAL '7 days'),
    -- Pending
    ('ORD-VND002-007', 'VND002_ORD_007', 'VND002', 'Fashion Store India', 'Pooja Nair', '9876600007', '505 MG Road, Thrissur', '680001', 'Thrissur', 'Kerala', 'KL', '[{"name": "Cotton T-Shirt (Men)", "price": 150, "quantity": 2}]', 799, 799, 0, 'prepaid', 'pending', NULL, NOW() - INTERVAL '1 day');

-- Orders for VND003 (Electronics Hub)
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered Orders
    ('ORD-VND003-001', 'VND003_ORD_001', 'VND003', 'Electronics Hub', 'Vikram Rao', '9876700001', '111 Electronic City, Phase 1', '560100', 'Bangalore', 'Karnataka', 'KA', '[{"name": "Wireless Bluetooth Earbuds", "price": 200, "quantity": 2}]', 1599, 1599, 951, 'prepaid', 'delivered', 'TRK201', NOW() - INTERVAL '25 days'),
    ('ORD-VND003-002', 'VND003_ORD_002', 'VND003', 'Electronics Hub', 'Suresh Menon', '9876700002', '222 IT Corridor, Whitefield', '560066', 'Bangalore', 'Karnataka', 'KA', '[{"name": "Wireless Mouse", "price": 150, "quantity": 1}, {"name": "Smartphone Stand", "price": 80, "quantity": 1}]', 699, 699, 313, 'cod', 'delivered', 'TRK202', NOW() - INTERVAL '22 days'),
    ('ORD-VND003-003', 'VND003_ORD_003', 'VND003', 'Electronics Hub', 'Ramesh Iyer', '9876700003', '333 Anna Nagar', '600040', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Wireless Bluetooth Earbuds", "price": 200, "quantity": 1}]', 999, 999, 683, 'prepaid', 'delivered', 'TRK203', NOW() - INTERVAL '19 days'),
    ('ORD-VND003-004', 'VND003_ORD_004', 'VND003', 'Electronics Hub', 'Mahesh Gupta', '9876700004', '444 Salt Lake, Sector V', '700091', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Wireless Mouse", "price": 150, "quantity": 2}]', 999, 999, 525, 'cod', 'delivered', 'TRK204', NOW() - INTERVAL '16 days'),
    ('ORD-VND003-005', 'VND003_ORD_005', 'VND003', 'Electronics Hub', 'Kiran Desai', '9876700005', '555 SG Highway, Bodakdev', '380054', 'Ahmedabad', 'Gujarat', 'GJ', '[{"name": "Smartphone Stand", "price": 80, "quantity": 3}]', 599, 599, 283, 'prepaid', 'delivered', 'TRK205', NOW() - INTERVAL '13 days'),
    -- RTO Orders
    ('ORD-VND003-006', 'VND003_ORD_006', 'VND003', 'Electronics Hub', 'No Response', '9876700006', '666 Remote Area', '560001', 'Bangalore', 'Karnataka', 'KA', '[{"name": "Wireless Bluetooth Earbuds", "price": 200, "quantity": 1}]', 999, 999, 0, 'cod', 'rto', 'TRK206', NOW() - INTERVAL '6 days'),
    -- In Transit
    ('ORD-VND003-007', 'VND003_ORD_007', 'VND003', 'Electronics Hub', 'Arun Pillai', '9876700007', '777 Technopark', '695581', 'Trivandrum', 'Kerala', 'KL', '[{"name": "Wireless Mouse", "price": 150, "quantity": 1}]', 599, 599, 0, 'prepaid', 'in_transit', 'TRK207', NOW() - INTERVAL '3 days');

-- Orders for VND004 (Home Decor Shop) 
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered
    ('ORD-VND004-001', 'VND004_ORD_001', 'VND004', 'Home Decor Shop', 'Sunita Kapoor', '9876800001', '101 Lajpat Nagar', '110024', 'New Delhi', 'Delhi', 'DL', '[{"name": "LED Table Lamp", "price": 180, "quantity": 1}]', 799, 799, 487, 'cod', 'delivered', 'TRK301', NOW() - INTERVAL '17 days'),
    ('ORD-VND004-002', 'VND004_ORD_002', 'VND004', 'Home Decor Shop', 'Geeta Sharma', '9876800002', '202 Sector 18, Dwarka', '110078', 'New Delhi', 'Delhi', 'DL', '[{"name": "Wall Clock", "price": 220, "quantity": 1}]', 699, 699, 359, 'prepaid', 'delivered', 'TRK302', NOW() - INTERVAL '14 days'),
    ('ORD-VND004-003', 'VND004_ORD_003', 'VND004', 'Home Decor Shop', 'Neha Malhotra', '9876800003', '303 Sector 44, Gurgaon', '122003', 'Gurgaon', 'Haryana', 'HR', '[{"name": "LED Table Lamp", "price": 180, "quantity": 2}]', 1399, 1399, 791, 'cod', 'delivered', 'TRK303', NOW() - INTERVAL '10 days'),
    -- RTO - High RTO for Delhi region
    ('ORD-VND004-004', 'VND004_ORD_004', 'VND004', 'Home Decor Shop', 'Cancelled 1', '9876800004', '404 Unknown', '110001', 'Delhi', 'Delhi', 'DL', '[{"name": "Wall Clock", "price": 220, "quantity": 1}]', 699, 699, 0, 'cod', 'rto', 'TRK304', NOW() - INTERVAL '8 days'),
    ('ORD-VND004-005', 'VND004_ORD_005', 'VND004', 'Home Decor Shop', 'Cancelled 2', '9876800005', '505 Unknown', '110002', 'Delhi', 'Delhi', 'DL', '[{"name": "LED Table Lamp", "price": 180, "quantity": 1}]', 799, 799, 0, 'cod', 'rto', 'TRK305', NOW() - INTERVAL '5 days');

-- Orders for VND005 (Sports World)
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered - Good performance
    ('ORD-VND005-001', 'VND005_ORD_001', 'VND005', 'Sports World', 'Ravi Kumar', '9876900001', '101 T Nagar', '600017', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Yoga Mat", "price": 120, "quantity": 1}]', 499, 499, 271, 'prepaid', 'delivered', 'TRK401', NOW() - INTERVAL '21 days'),
    ('ORD-VND005-002', 'VND005_ORD_002', 'VND005', 'Sports World', 'Karthik Raja', '9876900002', '202 Adyar', '600020', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Running Shoes", "price": 450, "quantity": 1}]', 1999, 1999, 1387, 'cod', 'delivered', 'TRK402', NOW() - INTERVAL '18 days'),
    ('ORD-VND005-003', 'VND005_ORD_003', 'VND005', 'Sports World', 'Deepa Krishnan', '9876900003', '303 Velachery', '600042', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Yoga Mat", "price": 120, "quantity": 2}]', 899, 899, 471, 'prepaid', 'delivered', 'TRK403', NOW() - INTERVAL '15 days'),
    ('ORD-VND005-004', 'VND005_ORD_004', 'VND005', 'Sports World', 'Ganesh Babu', '9876900004', '404 Anna Salai', '600002', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Running Shoes", "price": 450, "quantity": 1}]', 1999, 1999, 1387, 'cod', 'delivered', 'TRK404', NOW() - INTERVAL '12 days'),
    ('ORD-VND005-005', 'VND005_ORD_005', 'VND005', 'Sports World', 'Lakshmi Narayanan', '9876900005', '505 Mylapore', '600004', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Yoga Mat", "price": 120, "quantity": 1}]', 499, 499, 271, 'prepaid', 'delivered', 'TRK405', NOW() - INTERVAL '9 days'),
    -- Only 1 RTO - Low RTO rate
    ('ORD-VND005-006', 'VND005_ORD_006', 'VND005', 'Sports World', 'Return Request', '9876900006', '606 Besant Nagar', '600090', 'Chennai', 'Tamil Nadu', 'TN', '[{"name": "Running Shoes", "price": 450, "quantity": 1}]', 1999, 1999, 0, 'cod', 'rto', 'TRK406', NOW() - INTERVAL '4 days');

-- Orders for VND006 (Beauty Essentials) - Mixed performance
INSERT INTO orders (order_id, order_number, partner_id, partner_name, customer_name, customer_phone, shipping_address, pincode, city, state, customer_state, items, total_amount, selling_price, profit, payment_method, status, tracking_id, created_at)
VALUES 
    -- Delivered
    ('ORD-VND006-001', 'VND006_ORD_001', 'VND006', 'Beauty Essentials', 'Ritika Bose', '9877000001', '101 Park Street', '700016', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Face Serum", "price": 280, "quantity": 1}]', 899, 899, 519, 'prepaid', 'delivered', 'TRK501', NOW() - INTERVAL '23 days'),
    ('ORD-VND006-002', 'VND006_ORD_002', 'VND006', 'Beauty Essentials', 'Shreya Dutta', '9877000002', '202 Salt Lake', '700064', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Lipstick Set", "price": 180, "quantity": 1}]', 699, 699, 387, 'cod', 'delivered', 'TRK502', NOW() - INTERVAL '20 days'),
    ('ORD-VND006-003', 'VND006_ORD_003', 'VND006', 'Beauty Essentials', 'Moumita Sen', '9877000003', '303 Howrah', '711101', 'Howrah', 'West Bengal', 'WB', '[{"name": "Face Serum", "price": 280, "quantity": 2}]', 1599, 1599, 879, 'prepaid', 'delivered', 'TRK503', NOW() - INTERVAL '16 days'),
    -- RTO - Medium RTO rate  
    ('ORD-VND006-004', 'VND006_ORD_004', 'VND006', 'Beauty Essentials', 'Door Locked', '9877000004', '404 Remote Village', '700001', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Lipstick Set", "price": 180, "quantity": 2}]', 1199, 1199, 0, 'cod', 'rto', 'TRK504', NOW() - INTERVAL '11 days'),
    ('ORD-VND006-005', 'VND006_ORD_005', 'VND006', 'Beauty Essentials', 'Wrong Number', '9877000005', '505 Unknown Area', '700002', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Face Serum", "price": 280, "quantity": 1}]', 899, 899, 0, 'cod', 'rto', 'TRK505', NOW() - INTERVAL '7 days'),
    -- Pending
    ('ORD-VND006-006', 'VND006_ORD_006', 'VND006', 'Beauty Essentials', 'Amrita Roy', '9877000006', '606 EM Bypass', '700107', 'Kolkata', 'West Bengal', 'WB', '[{"name": "Lipstick Set", "price": 180, "quantity": 1}, {"name": "Face Serum", "price": 280, "quantity": 1}]', 1399, 1399, 0, 'prepaid', 'pending', NULL, NOW() - INTERVAL '2 days');

-- =====================================================
-- SUMMARY OF MOCK DATA:
-- =====================================================
-- Users: 6 vendors + 1 admin = 7 users
-- Products: 12 products across 5 categories
-- Orders: ~35 orders with mix of:
--   - Delivered: ~20 orders
--   - RTO/Returned: ~10 orders (various RTO rates per vendor)
--   - Pending/In Transit: ~5 orders
--   - States: MH, DL, KA, TN, WB, UP, RJ, GJ, HR, KL, TG
--   - Payment: Mix of COD and Prepaid
-- =====================================================

-- Verify data counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;

-- Verify orders by status
SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC;

-- Verify orders by state
SELECT customer_state, COUNT(*) as count FROM orders GROUP BY customer_state ORDER BY count DESC;

-- Verify orders by vendor
SELECT partner_id, COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
    SUM(CASE WHEN status = 'rto' THEN 1 ELSE 0 END) as rto
FROM orders GROUP BY partner_id ORDER BY total_orders DESC;
