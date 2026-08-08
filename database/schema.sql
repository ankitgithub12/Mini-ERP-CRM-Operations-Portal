-- ============================================================
-- Mini ERP + CRM Operations Portal — Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  email VARCHAR(255),
  business_name VARCHAR(255),
  gst_number VARCHAR(20),
  customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_follow_up_date ON customers(follow_up_date);

-- ============================================================
-- 3. CUSTOMER FOLLOWUPS TABLE
-- ============================================================
CREATE TABLE customer_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_followups_customer_id ON customer_followups(customer_id);
CREATE INDEX idx_followups_follow_up_date ON customer_followups(follow_up_date);

-- ============================================================
-- 4. PRODUCTS TABLE
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  warehouse_location VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- ============================================================
-- 5. STOCK MOVEMENTS TABLE
-- ============================================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  movement_type VARCHAR(5) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);

-- ============================================================
-- 6. CHALLANS TABLE
-- ============================================================
CREATE TABLE challans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challan_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  total_quantity INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challans_challan_number ON challans(challan_number);
CREATE INDEX idx_challans_customer_id ON challans(customer_id);
CREATE INDEX idx_challans_status ON challans(status);
CREATE INDEX idx_challans_created_at ON challans(created_at);

-- ============================================================
-- 7. CHALLAN ITEMS TABLE (with product snapshot)
-- ============================================================
CREATE TABLE challan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challan_id UUID NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challan_items_challan_id ON challan_items(challan_id);
CREATE INDEX idx_challan_items_product_id ON challan_items(product_id);

-- ============================================================
-- 8. FUNCTION: Generate Challan Number
-- ============================================================
CREATE OR REPLACE FUNCTION generate_challan_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  last_number INTEGER;
  new_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(challan_number FROM 9) AS INTEGER)
  ), 0)
  INTO last_number
  FROM challans
  WHERE challan_number LIKE 'CH-' || current_year || '-%';
  
  new_number := 'CH-' || current_year || '-' || LPAD((last_number + 1)::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. RPC: Confirm Challan (Atomic Transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION confirm_challan(p_challan_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_challan RECORD;
  v_item RECORD;
  v_product RECORD;
  v_challan_number TEXT;
BEGIN
  -- Lock and fetch challan
  SELECT * INTO v_challan FROM challans WHERE id = p_challan_id FOR UPDATE;
  
  IF v_challan IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Challan not found');
  END IF;
  
  IF v_challan.status != 'DRAFT' THEN
    RETURN json_build_object('success', false, 'message', 'Only DRAFT challans can be confirmed');
  END IF;
  
  v_challan_number := v_challan.challan_number;

  -- Check stock availability for ALL items first, then reduce
  FOR v_item IN SELECT * FROM challan_items WHERE challan_id = p_challan_id LOOP
    SELECT * INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;
    
    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item.product_name;
    END IF;
    
    IF v_product.current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %. Available: %, Requested: %', 
        v_product.product_name, v_product.current_stock, v_item.quantity;
    END IF;
  END LOOP;

  -- All checks passed — now reduce stock and create movements
  FOR v_item IN SELECT * FROM challan_items WHERE challan_id = p_challan_id LOOP
    -- Reduce stock
    UPDATE products 
    SET current_stock = current_stock - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id;
    
    -- Create OUT stock movement
    INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
    VALUES (
      v_item.product_id, 
      v_item.quantity, 
      'OUT', 
      'Challan ' || v_challan_number || ' confirmed',
      p_user_id
    );
  END LOOP;

  -- Update challan status
  UPDATE challans 
  SET status = 'CONFIRMED', updated_at = NOW() 
  WHERE id = p_challan_id;

  RETURN json_build_object('success', true, 'message', 'Challan confirmed successfully');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 10. Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challans_updated_at BEFORE UPDATE ON challans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
