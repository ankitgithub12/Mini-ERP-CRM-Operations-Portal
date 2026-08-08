const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

const getDashboardData = async () => {
  // Total customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  // Active customers
  const { count: activeCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active');

  // Total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // Low stock products
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, product_name, sku, current_stock, minimum_stock');

  const lowStockProducts = allProducts
    ? allProducts.filter((p) => p.current_stock <= p.minimum_stock)
    : [];

  // Draft challans
  const { count: draftChallans } = await supabase
    .from('challans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DRAFT');

  // Confirmed challans
  const { count: confirmedChallans } = await supabase
    .from('challans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'CONFIRMED');

  // Today's follow-ups
  const today = new Date().toISOString().split('T')[0];
  const { count: todayFollowUps } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('follow_up_date', today);

  // Recent challans
  const { data: recentChallans } = await supabase
    .from('challans')
    .select('*, customers:customer_id(customer_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Recent stock movements
  const { data: recentMovements } = await supabase
    .from('stock_movements')
    .select('*, products:product_id(product_name, sku), users:created_by(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Upcoming follow-ups (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const { data: upcomingFollowUps } = await supabase
    .from('customers')
    .select('id, customer_name, business_name, follow_up_date, status')
    .gte('follow_up_date', today)
    .lte('follow_up_date', nextWeek.toISOString().split('T')[0])
    .order('follow_up_date', { ascending: true })
    .limit(10);

  // Customer status distribution
  const { data: allCustomers } = await supabase
    .from('customers')
    .select('status');

  const statusDistribution = {
    Lead: 0,
    Active: 0,
    Inactive: 0,
  };
  if (allCustomers) {
    allCustomers.forEach((c) => {
      statusDistribution[c.status] = (statusDistribution[c.status] || 0) + 1;
    });
  }

  // Monthly challan count (last 6 months)
  const { data: allChallans } = await supabase
    .from('challans')
    .select('created_at, status')
    .gte(
      'created_at',
      new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString()
    );

  const monthlyChallans = {};
  if (allChallans) {
    allChallans.forEach((c) => {
      const month = new Date(c.created_at).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      monthlyChallans[month] = (monthlyChallans[month] || 0) + 1;
    });
  }

  return {
    kpis: {
      totalCustomers: totalCustomers || 0,
      activeCustomers: activeCustomers || 0,
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts.length,
      draftChallans: draftChallans || 0,
      confirmedChallans: confirmedChallans || 0,
      todayFollowUps: todayFollowUps || 0,
    },
    recentChallans: recentChallans || [],
    recentMovements: recentMovements || [],
    upcomingFollowUps: upcomingFollowUps || [],
    lowStockProducts: lowStockProducts.slice(0, 5),
    charts: {
      customerStatusDistribution: Object.entries(statusDistribution).map(
        ([name, value]) => ({ name, value })
      ),
      monthlyChallans: Object.entries(monthlyChallans).map(
        ([month, count]) => ({ month, count })
      ),
    },
  };
};

module.exports = { getDashboardData };
