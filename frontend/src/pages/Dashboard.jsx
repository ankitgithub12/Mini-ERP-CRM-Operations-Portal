import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Users, UserCheck, Package, AlertTriangle, FileText, CheckCircle,
  CalendarClock, TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const KPICard = ({ title, value, icon: Icon, color, link }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  const Card = link ? Link : 'div';

  return (
    <Card to={link} className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

const COLORS = ['#6366f1', '#10b981', '#94a3b8'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getData();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { kpis, recentChallans, recentMovements, upcomingFollowUps, lowStockProducts, charts } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={kpis.totalCustomers} icon={Users} color="blue" link="/customers" />
        <KPICard title="Active Customers" value={kpis.activeCustomers} icon={UserCheck} color="green" link="/customers?status=Active" />
        <KPICard title="Total Products" value={kpis.totalProducts} icon={Package} color="purple" link="/products" />
        <KPICard title="Low Stock" value={kpis.lowStockProducts} icon={AlertTriangle} color="red" link="/products" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Draft Challans" value={kpis.draftChallans} icon={FileText} color="amber" link="/challans?status=DRAFT" />
        <KPICard title="Confirmed Challans" value={kpis.confirmedChallans} icon={CheckCircle} color="indigo" link="/challans?status=CONFIRMED" />
        <KPICard title="Today's Follow-ups" value={kpis.todayFollowUps} icon={CalendarClock} color="teal" link="/followups" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Customer Status Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={charts.customerStatusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {charts.customerStatusDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Challans */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-semibold text-gray-900">Monthly Challans</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.monthlyChallans}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Challans */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Challans</h3>
            <Link to="/challans" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentChallans.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No challans yet</p>
            ) : (
              recentChallans.map((c) => (
                <Link key={c.id} to={`/challans/${c.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.challan_number}</p>
                    <p className="text-xs text-gray-500">{c.customers?.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(c.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Follow-ups</h3>
            <Link to="/followups" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingFollowUps.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No upcoming follow-ups</p>
            ) : (
              upcomingFollowUps.map((f) => (
                <Link key={f.id} to={`/customers/${f.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.customer_name}</p>
                    <p className="text-xs text-gray-500">{f.business_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${getStatusColor(f.status)}`}>{f.status}</span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(f.follow_up_date)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Low Stock Alerts</h3>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">All products are well stocked</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.product_name}</p>
                    <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-danger">
                      {p.current_stock} / {p.minimum_stock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Stock Movements</h3>
            <Link to="/stock-movements" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMovements.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No stock movements yet</p>
            ) : (
              recentMovements.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      m.movement_type === 'IN' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {m.movement_type === 'IN' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {m.products?.product_name}
                      </p>
                      <p className="text-xs text-gray-500">{m.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      m.movement_type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                    </span>
                    <p className="text-xs text-gray-400">{formatDate(m.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
