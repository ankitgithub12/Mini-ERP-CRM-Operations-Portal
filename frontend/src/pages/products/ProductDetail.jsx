import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { ArrowLeft, Edit, Plus, Minus, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(null); // 'in' or 'out'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const prodRes = await productService.getById(id);
      setProduct(prodRes.data.data);
      
      // Fetch movements separately. If 403 Forbidden is returned, handle it gracefully
      try {
        const movRes = await productService.getStockMovements(id, { limit: 20 });
        setMovements(movRes.data.data || []);
      } catch (movErr) {
        console.warn('Could not fetch stock movements:', movErr.message);
        setMovements(null); // Indicates permission error / request failure
      }
    } catch (err) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAction = async () => {
    const qty = parseInt(quantity);
    if (!qty || qty < 1) return toast.error('Enter a valid quantity');
    setSubmitting(true);
    try {
      const action = showStockModal === 'in' ? productService.stockIn : productService.stockOut;
      await action(id, { quantity: qty, reason });
      toast.success(`Stock ${showStockModal === 'in' ? 'added' : 'removed'} successfully`);
      setShowStockModal(null);
      setQuantity('');
      setReason('');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="page-title">{product.product_name}</h1>
            <p className="page-subtitle">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('stockIn') && (
            <button onClick={() => setShowStockModal('in')} className="btn-success btn-sm"><Plus className="w-4 h-4" /> Stock In</button>
          )}
          {hasPermission('stockOut') && (
            <button onClick={() => setShowStockModal('out')} className="btn-danger btn-sm"><Minus className="w-4 h-4" /> Stock Out</button>
          )}
          {hasPermission('products', 'edit') && (
            <Link to={`/products/${id}/edit`} className="btn-primary btn-sm"><Edit className="w-4 h-4" /> Edit</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card card-body">
            <div className="flex items-center gap-4 mb-4 animate-fade-in">
              {product.image_url ? (
                <img src={product.image_url} alt={product.product_name} className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm bg-gray-50 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
              )}
              <span className="badge badge-info">{product.category}</span>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500">Unit Price</p><p className="text-lg font-bold text-gray-900">{formatCurrency(product.unit_price)}</p></div>
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Current Stock</p><p className={`text-2xl font-bold ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>{product.current_stock}</p></div>
                {product.is_low_stock && <AlertTriangle className="w-6 h-6 text-amber-500" />}
              </div>
              <div><p className="text-xs text-gray-500">Minimum Stock</p><p className="text-sm font-medium">{product.minimum_stock}</p></div>
              <div><p className="text-xs text-gray-500">Warehouse</p><p className="text-sm font-medium">{product.warehouse_location || '—'}</p></div>
            </div>
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header"><h3 className="text-base font-semibold text-gray-900">Stock Movement History</h3></div>
            {movements === null ? (
              <div className="p-8 text-center text-sm text-amber-600 bg-amber-50 rounded-b-xl flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>You do not have permission to view stock movement history</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No stock movements recorded</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.movement_type === 'IN' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {m.movement_type === 'IN' ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.movement_type === 'IN' ? 'Stock In' : 'Stock Out'}</p>
                        <p className="text-xs text-gray-500">{m.reason || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${m.movement_type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                      </span>
                      <p className="text-xs text-gray-400">{formatDateTime(m.created_at)}</p>
                      <p className="text-xs text-gray-400">By {m.users?.name || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Modal */}
      <Modal
        isOpen={!!showStockModal}
        onClose={() => { setShowStockModal(null); setQuantity(''); setReason(''); }}
        title={showStockModal === 'in' ? 'Add Stock' : 'Remove Stock'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Quantity *</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Enter quantity" />
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input-field" rows={2} placeholder="Optional reason" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowStockModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleStockAction} disabled={submitting} className={showStockModal === 'in' ? 'btn-success' : 'btn-danger'}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : showStockModal === 'in' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;
