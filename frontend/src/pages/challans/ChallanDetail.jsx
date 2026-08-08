import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanService } from '../../services/challanService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Building, Phone, Mail, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // 'confirm' or 'cancel'
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchChallan(); }, [id]);

  const fetchChallan = async () => {
    try {
      const res = await challanService.getById(id);
      setChallan(res.data.data);
    } catch (err) {
      toast.error('Challan not found');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    setProcessing(true);
    try {
      if (confirmAction === 'confirm') {
        await challanService.confirm(id);
        toast.success('Challan confirmed! Stock has been deducted.');
      } else {
        await challanService.cancel(id);
        toast.success('Challan cancelled');
      }
      setConfirmAction(null);
      fetchChallan();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!challan) return null;

  const customer = challan.customers;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{challan.challan_number}</h1>
              <span className={`badge ${getStatusColor(challan.status)}`}>{challan.status}</span>
            </div>
            <p className="page-subtitle">Created on {formatDateTime(challan.created_at)} by {challan.users?.name}</p>
          </div>
        </div>
        {challan.status === 'DRAFT' && (
          <div className="flex items-center gap-2">
            {hasPermission('challans', 'confirm') && (
              <button onClick={() => setConfirmAction('confirm')} className="btn-success btn-sm">
                <CheckCircle className="w-4 h-4" /> Confirm
              </button>
            )}
            <button onClick={() => setConfirmAction('cancel')} className="btn-danger btn-sm">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{customer?.customer_name}</p>
                <p className="text-xs text-gray-500">{customer?.business_name}</p>
              </div>
            </div>
            {customer?.mobile && (
              <div className="flex items-start gap-3"><Phone className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.mobile}</p></div>
            )}
            {customer?.email && (
              <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.email}</p></div>
            )}
            {customer?.gst_number && (
              <div className="flex items-start gap-3"><FileText className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">GST: {customer.gst_number}</p></div>
            )}
            {customer?.address && (
              <div className="flex items-start gap-3 sm:col-span-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><p className="text-sm">{customer.address}</p></div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Items</h3></div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-gray-400">{index + 1}</td>
                  <td className="font-medium text-gray-900">{item.product_name}</td>
                  <td><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{item.sku}</span></td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td className="font-medium">{item.quantity}</td>
                  <td className="text-right font-medium">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-12">
            <div>
              <p className="text-xs text-gray-500">Total Quantity</p>
              <p className="text-lg font-bold text-gray-900">{challan.total_quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-primary-600">{formatCurrency(challan.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm/Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        message={
          confirmAction === 'confirm'
            ? 'This will deduct stock for all items. This action cannot be undone. Are you sure?'
            : 'This will cancel the challan. Are you sure?'
        }
        confirmText={processing ? 'Processing...' : confirmAction === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        variant={confirmAction === 'confirm' ? 'primary' : 'danger'}
      />
    </div>
  );
};

export default ChallanDetail;
