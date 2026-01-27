-- =====================================================
-- MERIDUKANSAPLAYER - Complete Supabase Schema
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
TNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    bank_details JSONB DEFAULT '{}',
    wallet_balance DECIMAL(12,2) DEFAULT 0,
    role VARCHAR(20) DEFAULT 'partner',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_partner_id ON users(partner_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- 2. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) UNIQUE NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    partner_id VARCHAR(20) NOT NULL,
    partner_name VARCHAR(255),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    shipping_address TEXT,
    pincode VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    items JSONB DEFAULT '[]',
    total_amount DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(20) DEFAULT 'cod',
    status VARCHAR(30) DEFAULT 'draft',
    tracking_id VARCHAR(100),
    notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    in_transit_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(12,2) DEFAULT 0,
    mrp DECIMAL(12,2),
    description TEXT,
    image_url TEXT,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    weight_kg DECIMAL(5,2) DEFAULT 0.5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- =====================================================
-- 4. WALLET TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    partner_id VARCHAR(20),
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'recharge', 'cod_collected'
    description TEXT,
    reference_id VARCHAR(100),
    balance_after DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_partner_id ON wallet_transactions(partner_id);

-- =====================================================
-- 5. SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    partner_id VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- =====================================================
-- 6. RECHARGE HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recharge_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    partner_id VARCHAR(20),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    screenshot_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recharge_partner_id ON recharge_history(partner_id);

-- =====================================================
-- 7. SHIPPING MANIFEST TABLE (for bulk exports)
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_manifests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manifest_id VARCHAR(50) UNIQUE NOT NULL,
    order_ids UUID[],
    total_orders INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'created',
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INITIAL DATA - Demo User
-- =====================================================
INSERT INTO users (partner_id, username, password, name, phone, address, wallet_balance, role)
VALUES (
    'VND001',
    'demo',
    'demo123',
    'Demo Partner',
    '9876543210',
    '123 Demo Street, Test City',
    5000,
    'partner'
) ON CONFLICT (username) DO NOTHING;

-- Admin user
INSERT INTO users (partner_id, username, password, name, role)
VALUES (
    'ADMIN001',
    'admin',
    'admin123',
    'Admin User',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- =====================================================
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, customize as needed)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for wallet" ON wallet_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true);

-- =====================================================
-- DONE! Your Supabase database is ready.
-- =====================================================
