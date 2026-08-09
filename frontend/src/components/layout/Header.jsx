import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // Connect to backend (supporting both production client config and local development defaults)
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to socket.io server');
      socket.emit('join_role_room', user.role);
    });

    socket.on('notification', (payload) => {
      console.log('New notification received:', payload);
      setNotifications(prev => [payload, ...prev].slice(0, 15));
      setUnreadCount(prev => prev + 1);
      
      // Trigger a live react-hot-toast alert with custom styled parameters
      toast((_t) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
            <span>{payload.type.replace('_', ' ')}</span>
          </div>
          <div className="text-xs text-slate-300">{payload.message}</div>
        </div>
      ), {
        icon: '🔔',
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: 'bg-purple-100 text-purple-700',
      Sales: 'bg-blue-100 text-blue-700',
      Warehouse: 'bg-amber-100 text-amber-700',
      Accounts: 'bg-emerald-100 text-emerald-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
              {user?.role}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setUnreadCount(0);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 divide-y divide-gray-100 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setShowDropdown(false);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-gray-50 flex flex-col gap-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          n.type === 'LOW_STOCK' ? 'bg-amber-100 text-amber-800' :
                          n.type === 'CHALLAN_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          n.type === 'NEW_CHALLAN' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {n.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-200" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
