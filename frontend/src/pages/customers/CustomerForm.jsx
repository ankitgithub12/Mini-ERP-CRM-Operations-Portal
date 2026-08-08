import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { customerService } from '../../services/customerService';
import { getErrorMessage } from '../../utils/helpers';
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../../utils/constants';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await customerService.getById(id);
      const data = res.data.data;
      // Format date for input
      if (data.follow_up_date) {
        data.follow_up_date = data.follow_up_date.split('T')[0];
      }
      reset(data);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!data.follow_up_date) data.follow_up_date = null;
      if (isEdit) {
        await customerService.update(id, data);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(data);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update customer information' : 'Create a new customer record'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Customer Name *</label>
              <input {...register('customer_name', { required: 'Customer name is required' })} className={`input-field ${errors.customer_name ? 'input-error' : ''}`} placeholder="Enter customer name" />
              {errors.customer_name && <p className="mt-1 text-xs text-red-600">{errors.customer_name.message}</p>}
            </div>
            <div>
              <label className="label">Business Name</label>
              <input {...register('business_name')} className="input-field" placeholder="Enter business name" />
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <input {...register('mobile')} className="input-field" placeholder="Enter mobile number" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" {...register('email')} className="input-field" placeholder="Enter email address" />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input {...register('gst_number')} className="input-field" placeholder="e.g. 27AABCU9603R1ZM" />
            </div>
            <div>
              <label className="label">Customer Type *</label>
              <select {...register('customer_type', { required: 'Customer type is required' })} className={`input-field ${errors.customer_type ? 'input-error' : ''}`}>
                <option value="">Select type</option>
                {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.customer_type && <p className="mt-1 text-xs text-red-600">{errors.customer_type.message}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input-field">
                {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Follow-up Date</label>
              <input type="date" {...register('follow_up_date')} className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea {...register('address')} className="input-field" rows={2} placeholder="Enter full address" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="Additional notes about this customer" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
