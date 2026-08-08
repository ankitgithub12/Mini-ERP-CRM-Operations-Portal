import { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAllStockMovements({ page, limit: 20 });
      setMovements(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Stock Movements</h1>
        <p className="page-subtitle">Track all inventory movements</p>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : movements.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No stock movements" message="Stock movements will appear here when inventory changes" />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          m.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {m.movement_type === 'IN' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {m.movement_type}
                        </div>
                      </td>
                      <td className="font-medium text-gray-900">{m.products?.product_name || '—'}</td>
                      <td><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{m.products?.sku || '—'}</span></td>
                      <td>
                        <span className={`font-semibold ${m.movement_type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500 max-w-[200px] truncate">{m.reason || '—'}</td>
                      <td className="text-sm">{m.users?.name || '—'}</td>
                      <td className="text-sm text-gray-500">{formatDateTime(m.created_at)}</td>
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

export default StockMovements;
