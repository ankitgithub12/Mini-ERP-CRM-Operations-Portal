import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Package,
  ArrowLeftRight,
  FileText,
  UserCog,
  X,
  Box,
  Settings as SettingsIcon,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
  },
  { type: 'divider', label: 'CRM', roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
    roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
  },
  {
    label: 'Follow-ups',
    path: '/followups',
    icon: CalendarClock,
    roles: ['Admin', 'Sales', 'Accounts'],
  },
  { type: 'divider', label: 'Inventory', roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
  },
  {
    label: 'Stock Movements',
    path: '/stock-movements',
    icon: ArrowLeftRight,
    roles: ['Admin', 'Warehouse', 'Accounts'],
  },
  { type: 'divider', label: 'Sales', roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
  {
    label: 'Challans',
    path: '/challans',
    icon: FileText,
    roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
  },
  { type: 'divider', label: 'Administration', roles: ['Admin'] },
  {
    label: 'Users',
    path: '/users',
    icon: UserCog,
    roles: ['Admin'],
  },
  { type: 'divider', label: 'System', roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'] },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    roles: ['Admin', 'Sales', 'Warehouse', 'Accounts'],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">MiniERP</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">Operations Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-sidebar-hover rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {filteredItems.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={i} className="pt-4 pb-1 px-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-600/90 text-white'
                    : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
