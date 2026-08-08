import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime, getStatusColor, getErrorMessage } from '../../utils/helpers';
import { ArrowLeft, Edit, Calendar, Plus, User, Building, Phone, Mail, MapPin, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [custRes, fuRes] = await Promise.all([
        customerService.getById(id),
        hasPermission('followups', 'view') ? customerService.getFollowUps(id) : Promise.resolve({ data: { data: [] } }),
      ]);
      setCustomer(custRes.data.data);
      setFollowUps(fuRes.data.data || []);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!followUpDate) return toast.error('Please select a follow-up date');
    setSubmitting(true);
    try {
      await customerService.createFollowUp(id, { follow_up_date: followUpDate, notes: followUpNotes });
      toast.success('Follow-up added');
      setShowFollowUpModal(false);
      setFollowUpDate('');
      setFollowUpNotes('');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="page-title">{customer.customer_name}</h1>
            <p className="page-subtitle">{customer.business_name || 'Customer Details'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('followups', 'create') && (
            <button onClick={() => setShowFollowUpModal(true)} className="btn-secondary btn-sm"><Plus className="w-4 h-4" /> Follow-up</button>
          )}
          {hasPermission('customers', 'edit') && (
            <Link to={`/customers/${id}/edit`} className="btn-primary btn-sm"><Edit className="w-4 h-4" /> Edit</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card card-body space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <span className={`badge ${getStatusColor(customer.status)}`}>{customer.status}</span>
                <span className="badge badge-purple ml-2">{customer.customer_type}</span>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {customer.business_name && (
                <div className="flex items-start gap-3"><Building className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">{customer.business_name}</span></div>
              )}
              {customer.mobile && (
                <div className="flex items-start gap-3"><Phone className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">{customer.mobile}</span></div>
              )}
              {customer.email && (
                <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">{customer.email}</span></div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">{customer.address}</span></div>
              )}
              {customer.gst_number && (
                <div className="flex items-start gap-3"><FileText className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">GST: {customer.gst_number}</span></div>
              )}
              {customer.follow_up_date && (
                <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-gray-400 mt-0.5" /><span className="text-sm">Next follow-up: {formatDate(customer.follow_up_date)}</span></div>
              )}
            </div>
            {customer.notes && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up History */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-base font-semibold text-gray-900">Follow-up History</h3>
            </div>
            {followUps.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No follow-ups recorded</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {followUps.map((fu) => (
                  <div key={fu.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(fu.follow_up_date)}</p>
                        <p className="text-sm text-gray-600 mt-1">{fu.notes || 'No notes'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">By {fu.users?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(fu.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      <Modal isOpen={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="Add Follow-up">
        <div className="space-y-4">
          <div>
            <label className="label">Follow-up Date *</label>
            <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} className="input-field" rows={3} placeholder="Add notes about this follow-up" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowFollowUpModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddFollowUp} disabled={submitting} className="btn-primary">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Add Follow-up'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
