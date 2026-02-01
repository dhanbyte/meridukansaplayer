-- =====================================================
-- ADD CUSTOMER_STATE COLUMN FOR ANALYTICS
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Step 1: Add customer_state column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_state VARCHAR(10);

-- Step 2: Populate customer_state from existing state field
UPDATE orders 
SET customer_state = state 
WHERE customer_state IS NULL;

-- Step 3: Update selling_price from total_amount where needed
UPDATE orders 
SET selling_price = total_amount 
WHERE selling_price IS NULL OR selling_price = 0;

-- Verify the changes
SELECT 
    COUNT(*) as total_orders,
    COUNT(customer_state) as orders_with_customer_state,
    COUNT(CASE WHEN selling_price > 0 THEN 1 END) as orders_with_selling_price
FROM orders;

-- Show sample data
SELECT 
    order_number, 
    state, 
    customer_state, 
    total_amount, 
    selling_price, 
    status 
FROM orders 
LIMIT 10;
