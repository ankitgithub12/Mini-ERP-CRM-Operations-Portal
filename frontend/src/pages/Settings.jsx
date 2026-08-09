import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    stockAlerts: true,
    newChallanAlerts: true,
    denseLayout: false,
    theme: 'Light',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Load preferences from local storage if existing
  useEffect(() => {
    const saved = localStorage.getItem('erp_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('erp_preferences', JSON.stringify(updated));
    toast.success('Preference updated successfully');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setSubmittingPassword(true);
    setTimeout(() => {
      setSubmittingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully! (Mocked API action)');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account credentials and system preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation/Profile Summary card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-0 shadow-lg">
            <div className="card-body flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-3xl font-bold shadow-inner">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-white">{user?.name || 'User Profile'}</h2>
              <p className="text-sm text-indigo-100">{user?.email}</p>
              <span className="mt-3 px-3 py-1 bg-white/25 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/10 text-white">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-4 divide-y divide-gray-100">
              <div className="flex items-center gap-3 py-3 text-primary-600 font-medium">
                <User className="w-5 h-5" />
                <span>Account Details</span>
              </div>
              <div className="flex items-center gap-3 py-3 text-gray-600">
                <Bell className="w-5 h-5" />
                <span>Notification Settings</span>
              </div>
              <div className="flex items-center gap-3 py-3 text-gray-600">
                <Shield className="w-5 h-5" />
                <span>Security & Permissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Section: Account Profile Details */}
          <div className="card shadow-sm border border-gray-100">
            <div className="card-header border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-semibold text-gray-800">Profile Information</h3>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs text-gray-400">Full Name</label>
                <div className="input-field bg-gray-50 text-gray-700 cursor-not-allowed select-none font-medium">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Email Address</label>
                <div className="input-field bg-gray-50 text-gray-700 cursor-not-allowed select-none font-medium">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Role Privilege Level</label>
                <div className="input-field bg-gray-50 text-gray-700 cursor-not-allowed select-none font-medium">
                  {user?.role}
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">System Permission Status</label>
                <div className="input-field bg-gray-50 text-emerald-700 border border-emerald-200 cursor-not-allowed select-none font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Operations
                </div>
              </div>
            </div>
          </div>

          {/* Section: System Preferences */}
          <div className="card shadow-sm border border-gray-100">
            <div className="card-header border-b border-gray-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-semibold text-gray-800">Preferences</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">Low Stock Alert Notifications</h4>
                  <p className="text-xs text-gray-400">Send email alert notifications when stock levels reach minimum thresholds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.stockAlerts}
                  onChange={(e) => handlePreferenceChange('stockAlerts', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">New Challan Alert Toggles</h4>
                  <p className="text-xs text-gray-400">Display push notification popups immediately when a draft challan is created.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newChallanAlerts}
                  onChange={(e) => handlePreferenceChange('newChallanAlerts', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">Dense Table Layouts</h4>
                  <p className="text-xs text-gray-400">Reduce cell padding inside inventory lists and challan grids.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.denseLayout}
                  onChange={(e) => handlePreferenceChange('denseLayout', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Change Password */}
          <form onSubmit={handlePasswordSubmit} className="card shadow-sm border border-gray-100">
            <div className="card-header border-b border-gray-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-semibold text-gray-800">Change Password</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Current Password *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={submittingPassword}
                className="btn-primary flex items-center gap-1.5"
              >
                {submittingPassword ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
