require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const seed = async () => {
  console.log('🌱 Starting seed...\n');

  try {
    // ── CLEANUP DATABASE ──────────────────────────────────
    console.log('Cleaning up existing database tables...');
    await supabase.from('challan_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('challans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stock_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customer_followups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('email', '');
    console.log('✅ Database cleaned\n');

    // ── 1. USERS ──────────────────────────────────────────
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(12);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('Admin@123', salt),
        role: 'Admin',
      },
      {
        name: 'Sales Executive',
        email: 'sales@example.com',
        password_hash: await bcrypt.hash('Sales@123', salt),
        role: 'Sales',
      },
      {
        name: 'Warehouse Manager',
        email: 'warehouse@example.com',
        password_hash: await bcrypt.hash('Warehouse@123', salt),
        role: 'Warehouse',
      },
      {
        name: 'Accounts Officer',
        email: 'accounts@example.com',
        password_hash: await bcrypt.hash('Accounts@123', salt),
        role: 'Accounts',
      },
    ];

    const { data: createdUsers, error: userError } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'email' })
      .select();

    if (userError) throw userError;
    console.log(`✅ ${createdUsers.length} users created`);

    const adminId = createdUsers.find((u) => u.role === 'Admin').id;
    const salesId = createdUsers.find((u) => u.role === 'Sales').id;
    const warehouseId = createdUsers.find((u) => u.role === 'Warehouse').id;

    // ── 2. CUSTOMERS ──────────────────────────────────────
    console.log('Creating customers...');
    const customers = [
      {
        customer_name: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh@abctraders.com',
        business_name: 'ABC Traders',
        gst_number: '27AABCU9603R1ZM',
        customer_type: 'Wholesale',
        address: '45, Market Road, Mumbai, Maharashtra',
        status: 'Active',
        follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        notes: 'Regular bulk buyer, prefers monthly orders',
      },
      {
        customer_name: 'Priya Sharma',
        mobile: '9876543211',
        email: 'priya@xyzenterprises.com',
        business_name: 'XYZ Enterprises',
        gst_number: '07AABCT1234L1ZP',
        customer_type: 'Distributor',
        address: '12, Industrial Area, Delhi',
        status: 'Active',
        follow_up_date: new Date().toISOString().split('T')[0],
        notes: 'Key distributor for North India region',
      },
      {
        customer_name: 'Amit Patel',
        mobile: '9876543212',
        email: 'amit@patelsupply.com',
        business_name: 'Patel Supply Co.',
        gst_number: '24AABCP5678K1ZQ',
        customer_type: 'Wholesale',
        address: '78, Station Road, Ahmedabad, Gujarat',
        status: 'Active',
        notes: 'Specializes in electronics accessories',
      },
      {
        customer_name: 'Sunita Reddy',
        mobile: '9876543213',
        email: 'sunita@reddyretail.com',
        business_name: 'Reddy Retail',
        gst_number: '36AABCR9012M1ZR',
        customer_type: 'Retail',
        address: '23, MG Road, Hyderabad, Telangana',
        status: 'Lead',
        follow_up_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        notes: 'Potential new retail partner',
      },
      {
        customer_name: 'Vikram Singh',
        mobile: '9876543214',
        email: 'vikram@singhtrading.com',
        business_name: 'Singh Trading House',
        gst_number: '09AABCS3456N1ZS',
        customer_type: 'Wholesale',
        address: '56, Civil Lines, Lucknow, UP',
        status: 'Active',
        notes: 'Handles UP and Bihar distribution',
      },
      {
        customer_name: 'Neha Gupta',
        mobile: '9876543215',
        email: 'neha@guptastore.com',
        business_name: 'Gupta General Store',
        gst_number: '33AABCG7890P1ZT',
        customer_type: 'Retail',
        address: '89, Anna Nagar, Chennai, TN',
        status: 'Inactive',
        notes: 'Previously active, paused due to market conditions',
      },
      {
        customer_name: 'Arjun Nair',
        mobile: '9876543216',
        email: 'arjun@naircommerce.com',
        business_name: 'Nair Commerce',
        gst_number: '32AABCN2345Q1ZU',
        customer_type: 'Distributor',
        address: '34, MG Road, Kochi, Kerala',
        status: 'Active',
        follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        notes: 'South India distribution network',
      },
      {
        customer_name: 'Deepak Joshi',
        mobile: '9876543217',
        email: 'deepak@joshimarts.com',
        business_name: 'Joshi Marts',
        gst_number: '20AABCJ6789R1ZV',
        customer_type: 'Retail',
        address: '67, Main Street, Ranchi, Jharkhand',
        status: 'Lead',
        notes: 'New lead from trade show',
      },
      {
        customer_name: 'Kavita Deshmukh',
        mobile: '9876543218',
        email: 'kavita@deshmukhgroup.com',
        business_name: 'Deshmukh Group',
        gst_number: '27AABCD0123S1ZW',
        customer_type: 'Wholesale',
        address: '90, FC Road, Pune, Maharashtra',
        status: 'Active',
        notes: 'Large volume orders quarterly',
      },
      {
        customer_name: 'Rohit Mehta',
        mobile: '9876543219',
        email: 'rohit@mehtasolutions.com',
        business_name: 'Mehta Solutions',
        gst_number: '06AABCM4567T1ZX',
        customer_type: 'Distributor',
        address: '12, Sector 18, Noida, UP',
        status: 'Active',
        notes: 'Technology products specialist',
      },
    ];

    const { data: createdCustomers, error: custError } = await supabase
      .from('customers')
      .insert(customers)
      .select();

    if (custError) throw custError;
    console.log(`✅ ${createdCustomers.length} customers created`);

    // ── 3. PRODUCTS ───────────────────────────────────────
    console.log('Creating products...');
    const products = [
      {
        product_name: 'Wireless Bluetooth Headphones',
        sku: 'PROD-001',
        category: 'Electronics',
        unit_price: 1500.0,
        current_stock: 100,
        minimum_stock: 20,
        warehouse_location: 'A-1-01',
      },
      {
        product_name: 'USB-C Charging Cable (1m)',
        sku: 'PROD-002',
        category: 'Accessories',
        unit_price: 250.0,
        current_stock: 500,
        minimum_stock: 100,
        warehouse_location: 'A-2-05',
      },
      {
        product_name: 'Portable Power Bank 10000mAh',
        sku: 'PROD-003',
        category: 'Electronics',
        unit_price: 800.0,
        current_stock: 75,
        minimum_stock: 15,
        warehouse_location: 'B-1-03',
      },
      {
        product_name: 'Smartphone Screen Protector',
        sku: 'PROD-004',
        category: 'Accessories',
        unit_price: 150.0,
        current_stock: 8,
        minimum_stock: 50,
        warehouse_location: 'A-3-02',
      },
      {
        product_name: 'Wireless Mouse',
        sku: 'PROD-005',
        category: 'Peripherals',
        unit_price: 600.0,
        current_stock: 200,
        minimum_stock: 30,
        warehouse_location: 'B-2-01',
      },
      {
        product_name: 'LED Desk Lamp',
        sku: 'PROD-006',
        category: 'Lighting',
        unit_price: 950.0,
        current_stock: 45,
        minimum_stock: 10,
        warehouse_location: 'C-1-04',
      },
      {
        product_name: 'Mechanical Keyboard',
        sku: 'PROD-007',
        category: 'Peripherals',
        unit_price: 2500.0,
        current_stock: 5,
        minimum_stock: 10,
        warehouse_location: 'B-2-03',
      },
      {
        product_name: 'HDMI Cable 2m',
        sku: 'PROD-008',
        category: 'Accessories',
        unit_price: 350.0,
        current_stock: 300,
        minimum_stock: 50,
        warehouse_location: 'A-2-08',
      },
      {
        product_name: 'Webcam HD 1080p',
        sku: 'PROD-009',
        category: 'Electronics',
        unit_price: 1800.0,
        current_stock: 60,
        minimum_stock: 15,
        warehouse_location: 'B-1-06',
      },
      {
        product_name: 'Laptop Stand - Aluminum',
        sku: 'PROD-010',
        category: 'Accessories',
        unit_price: 1200.0,
        current_stock: 3,
        minimum_stock: 8,
        warehouse_location: 'C-2-01',
      },
    ];

    const { data: createdProducts, error: prodError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (prodError) throw prodError;
    console.log(`✅ ${createdProducts.length} products created`);

    // ── 4. STOCK MOVEMENTS (IN) ───────────────────────────
    console.log('Creating stock movements...');
    const movements = createdProducts.map((p) => ({
      product_id: p.id,
      quantity: p.current_stock,
      movement_type: 'IN',
      reason: 'Initial stock',
      created_by: warehouseId,
    }));

    const { data: createdMovements, error: movError } = await supabase
      .from('stock_movements')
      .insert(movements)
      .select();

    if (movError) throw movError;
    console.log(`✅ ${createdMovements.length} stock movements created`);

    // ── 5. FOLLOW-UPS ─────────────────────────────────────
    console.log('Creating follow-ups...');
    const followUps = [
      {
        customer_id: createdCustomers[0].id,
        follow_up_date: new Date().toISOString().split('T')[0],
        notes: 'Discuss Q3 bulk order requirements',
        created_by: salesId,
      },
      {
        customer_id: createdCustomers[1].id,
        follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: 'Follow up on distribution agreement renewal',
        created_by: salesId,
      },
      {
        customer_id: createdCustomers[3].id,
        follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        notes: 'Send product catalog and pricing',
        created_by: salesId,
      },
    ];

    const { error: followUpError } = await supabase
      .from('customer_followups')
      .insert(followUps);

    if (followUpError) throw followUpError;
    console.log(`✅ ${followUps.length} follow-ups created`);

    // ── 6. SAMPLE CHALLANS ────────────────────────────────
    console.log('Creating sample challans...');

    // Generate challan number 1
    const { data: challanNum1 } = await supabase.rpc('generate_challan_number');

    // Draft Challan
    const { data: draftChallan, error: draftError } = await supabase
      .from('challans')
      .insert({
        challan_number: challanNum1 || 'CH-2026-0001',
        customer_id: createdCustomers[0].id,
        total_quantity: 15,
        total_amount: 16250.0,
        status: 'DRAFT',
        created_by: salesId,
      })
      .select()
      .single();

    if (draftError) throw draftError;

    // Draft challan items
    await supabase.from('challan_items').insert([
      {
        challan_id: draftChallan.id,
        product_id: createdProducts[0].id,
        product_name: createdProducts[0].product_name,
        sku: createdProducts[0].sku,
        unit_price: createdProducts[0].unit_price,
        quantity: 10,
        total_price: 15000.0,
      },
      {
        challan_id: draftChallan.id,
        product_id: createdProducts[1].id,
        product_name: createdProducts[1].product_name,
        sku: createdProducts[1].sku,
        unit_price: createdProducts[1].unit_price,
        quantity: 5,
        total_price: 1250.0,
      },
    ]);

    // Generate challan number 2
    const { data: challanNum2 } = await supabase.rpc('generate_challan_number');

    // Confirmed Challan (use RPC for proper stock handling)
    const { data: confirmedChallan, error: confError } = await supabase
      .from('challans')
      .insert({
        challan_number: challanNum2 || 'CH-2026-0002',
        customer_id: createdCustomers[1].id,
        total_quantity: 20,
        total_amount: 7000.0,
        status: 'DRAFT',
        created_by: salesId,
      })
      .select()
      .single();

    if (confError) throw confError;

    await supabase.from('challan_items').insert([
      {
        challan_id: confirmedChallan.id,
        product_id: createdProducts[4].id,
        product_name: createdProducts[4].product_name,
        sku: createdProducts[4].sku,
        unit_price: createdProducts[4].unit_price,
        quantity: 5,
        total_price: 3000.0,
      },
      {
        challan_id: confirmedChallan.id,
        product_id: createdProducts[7].id,
        product_name: createdProducts[7].product_name,
        sku: createdProducts[7].sku,
        unit_price: createdProducts[7].unit_price,
        quantity: 15,
        total_price: 5250.0,
      },
    ]);

    // Confirm the challan using RPC
    await supabase.rpc('confirm_challan', {
      p_challan_id: confirmedChallan.id,
      p_user_id: salesId,
    });

    console.log('✅ 2 challans created (1 DRAFT, 1 CONFIRMED)');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Login credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin:     admin@example.com / Admin@123');
    console.log('Sales:     sales@example.com / Sales@123');
    console.log('Warehouse: warehouse@example.com / Warehouse@123');
    console.log('Accounts:  accounts@example.com / Accounts@123');
    console.log('─────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
