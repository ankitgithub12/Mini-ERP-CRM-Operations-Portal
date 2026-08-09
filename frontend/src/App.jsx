import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';
import FollowUps from './pages/customers/FollowUps';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';
import StockMovements from './pages/products/StockMovements';
import ChallanList from './pages/challans/ChallanList';
import ChallanForm from './pages/challans/ChallanForm';
import ChallanDetail from './pages/challans/ChallanDetail';
import UserList from './pages/users/UserList';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={
              <ProtectedRoute roles={['Admin', 'Sales']}><CustomerForm /></ProtectedRoute>
            } />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={
              <ProtectedRoute roles={['Admin', 'Sales']}><CustomerForm /></ProtectedRoute>
            } />
            <Route path="/followups" element={<FollowUps />} />

            {/* Products */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={
              <ProtectedRoute roles={['Admin', 'Warehouse']}><ProductForm /></ProtectedRoute>
            } />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={
              <ProtectedRoute roles={['Admin', 'Warehouse']}><ProductForm /></ProtectedRoute>
            } />
            <Route path="/stock-movements" element={<StockMovements />} />

            {/* Challans */}
            <Route path="/challans" element={<ChallanList />} />
            <Route path="/challans/new" element={
              <ProtectedRoute roles={['Admin', 'Sales']}><ChallanForm /></ProtectedRoute>
            } />
            <Route path="/challans/:id" element={<ChallanDetail />} />

            {/* Users - Admin only */}
            <Route path="/users" element={
              <ProtectedRoute roles={['Admin']}><UserList /></ProtectedRoute>
            } />

            {/* Settings - All roles */}
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
