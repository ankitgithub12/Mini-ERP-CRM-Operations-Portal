import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from '../../utils/constants';
import { Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList = () => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (customerType) params.customer_type = customerType;

      const res = await customerService.getAll(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, customerType]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleDelete = async () => {
    try {
      await customerService.delete(deleteId);
      toast.success('Customer deactivated');
      setDeleteId(null);
      fetchCustomers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        {hasPermission('customers', 'create') && (
          <Link to="/customers/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Customer
          </Link>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <SearchFilter
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search by name, mobile, email..."
            filters={[
              { key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: CUSTOMER_STATUSES },
              { key: 'type', value: customerType, onChange: (v) => { setCustomerType(v); setPage(1); }, placeholder: 'All Types', options: CUSTOMER_TYPES },
            ]}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" message="Try adjusting your search or filter criteria" />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{c.customer_name}</p>
                          <p className="text-xs text-gray-500">{c.business_name || '—'}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm">{c.mobile || '—'}</p>
                          <p className="text-xs text-gray-500">{c.email || '—'}</p>
                        </div>
                      </td>
                      <td><span className="badge badge-purple">{c.customer_type}</span></td>
                      <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span></td>
                      <td className="text-sm">{formatDate(c.follow_up_date)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/customers/${c.id}`} className="btn-icon" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {hasPermission('customers', 'edit') && (
                            <Link to={`/customers/${c.id}/edit`} className="btn-icon" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                          {hasPermission('customers', 'delete') && (
                            <button onClick={() => setDeleteId(c.id)} className="btn-icon text-red-500 hover:text-red-700 hover:bg-red-50" title="Deactivate">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Customer"
        message="Are you sure you want to deactivate this customer? They can be reactivated later."
        confirmText="Deactivate"
      />
    </div>
  );
};

export default CustomerList;
