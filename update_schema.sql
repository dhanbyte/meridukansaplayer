-- =====================================================
-- MERIDUKANSAPLAYER - Schema Update for Product Management & Cart Module
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD NEW COLUMNS TO PRODUCTS TABLE
-- =====================================================

-- Add extra_images array for multi-image carousel
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS extra_images TEXT[] DEFAULT '{}';

-- Add packing cost per unit
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS packing_cost_per_unit DECIMAL(10,2) DEFAULT 0;

-- Add MRP/Selling price if not exists (for vendor profit margin display)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS mrp DECIMAL(12,2);

-- =====================================================
-- 2. CREATE GLOBAL SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster key lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(setting_key);

-- =====================================================
-- 3. INSERT DEFAULT GLOBAL SETTINGS
-- =====================================================

-- Delivery Charge (flat rate)
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('delivery_charge', '80', 'Flat delivery charge in rupees')
ON CONFLICT (setting_key) DO NOTHING;

-- COD Charge (fixed)
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('cod_charge', '40', 'Cash on Delivery extra charge in rupees')
ON CONFLICT (setting_key) DO NOTHING;

-- Platform/Handling Fee (percentage)
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('platform_fee_percent', '5', 'Platform fee as percentage of product cost')
ON CONFLICT (setting_key) DO NOTHING;

-- Free Delivery Threshold
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('free_delivery_threshold', '2000', 'Order amount above which delivery is free')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for global_settings" ON global_settings;
CREATE POLICY "Allow all for global_settings" ON global_settings FOR ALL USING (true);

-- =====================================================
-- DONE! Schema update complete.
-- =====================================================

-- =====================================================
-- PHASE 2: Dynamic Charges - Product-Level Overrides
-- =====================================================  

-- Add product-level charge override fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS use_global_charges BOOLEAN DEFAULT true;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS custom_delivery_charge DECIMAL(10,2);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS custom_rto_penalty DECIMAL(10,2);

-- Add RTO penalty to global settings
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('rto_penalty_charge', '100', 'RTO penalty charge in rupees')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- DONE! Dynamic Charges schema update complete.
-- =====================================================
