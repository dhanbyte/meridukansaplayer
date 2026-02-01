-- =====================================================
-- MERIDUKANSAPLAYER - Dynamic Charges Schema Update
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Add custom charge fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_delivery_charge DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_packing_charge DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_rto_charge DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_global_charges BOOLEAN DEFAULT true;

-- Add RTO charge to global settings
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('rto_charge', '100', 'RTO (Return to Origin) penalty charge in INR')
ON CONFLICT (setting_key) DO NOTHING;

-- Add packing charge to global settings
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('packing_charge', '20', 'Global packing charge per item in INR')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster charge lookups
CREATE INDEX IF NOT EXISTS idx_products_use_global_charges ON products(use_global_charges);

-- =====================================================
-- Create global_settings table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow all for global_settings" ON global_settings;
CREATE POLICY "Allow all for global_settings" ON global_settings FOR ALL USING (true);

-- Insert default global settings
INSERT INTO global_settings (setting_key, setting_value, description) VALUES
('delivery_charge', '80', 'Standard delivery charge in INR'),
('cod_charge', '40', 'COD handling charge in INR'),
('platform_fee_percent', '5', 'Platform fee as percentage'),
('free_delivery_threshold', '2000', 'Order amount for free delivery'),
('rto_charge', '100', 'RTO penalty charge in INR'),
('packing_charge', '20', 'Global packing charge per item in INR')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- DONE! Run this in Supabase SQL Editor
-- =====================================================
