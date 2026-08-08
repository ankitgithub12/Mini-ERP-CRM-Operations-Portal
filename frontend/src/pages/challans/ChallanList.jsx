import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../../services/challanService';
import { useAuth } from '../../context/AuthContext';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { CHALLAN_STATUSES } from '../../utils/constants';
import { Plus, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ChallanList = () => {
  const { hasPermission } = useAuth();
  const [challans, setChallans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await challanService.getAll(params);
      setChallans(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchChallans(), 300);
    return () => clearTimeout(timer);
  }, [fetchChallans]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Sales Challans</h1>
          <p className="page-subtitle">Manage sales challans and invoices</p>
        </div>
        {hasPermission('challans', 'create') && (
          <Link to="/challans/new" className="btn-primary"><Plus className="w-4 h-4" /> New Challan</Link>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <SearchFilter
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search by challan number..."
            filters={[
              { key: 'status', value: status, onChange: (v) => { setStatus(v); setPage(1); }, placeholder: 'All Statuses', options: CHALLAN_STATUSES },
            ]}
          />
        </div>

        {loading ? <LoadingSpinner /> : challans.length === 0 ? (
          <EmptyState icon={FileText} title="No challans found" message="Create your first sales challan" />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Items Qty</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((c) => (
                    <tr key={c.id}>
                      <td><span className="font-mono font-medium text-primary-600">{c.challan_number}</span></td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{c.customers?.customer_name || '—'}</p>
                          <p className="text-xs text-gray-500">{c.customers?.business_name || ''}</p>
                        </div>
                      </td>
                      <td className="font-medium">{c.total_quantity}</td>
                      <td className="font-medium">{formatCurrency(c.total_amount)}</td>
                      <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span></td>
                      <td>
                        <div>
                          <p className="text-sm">{formatDate(c.created_at)}</p>
                          <p className="text-xs text-gray-400">By {c.users?.name || '—'}</p>
                        </div>
                      </td>
                      <td>
                        <Link to={`/challans/${c.id}`} className="btn-icon" title="View"><Eye className="w-4 h-4" /></Link>
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
    </div>
  );
};

export default ChallanList;
