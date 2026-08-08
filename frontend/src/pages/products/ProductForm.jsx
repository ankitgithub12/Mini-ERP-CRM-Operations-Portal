import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productService } from '../../services/productService';
import { getErrorMessage } from '../../utils/helpers';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { current_stock: 0, minimum_stock: 0 },
  });

  const handleGenerateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const autoSKU = `PROD-${timestamp}-${randomStr}`;
    setValue('sku', autoSKU, { shouldValidate: true });
    toast.success('SKU code generated');
  };

  useEffect(() => {
    if (isEdit) {
      productService.getById(id).then((res) => { reset(res.data.data); setFetching(false); }).catch(() => { toast.error('Product not found'); navigate('/products'); });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      data.unit_price = parseFloat(data.unit_price);
      data.minimum_stock = parseInt(data.minimum_stock);
      if (!isEdit) data.current_stock = parseInt(data.current_stock || 0);

      if (isEdit) {
        const { current_stock, ...updateData } = data;
        await productService.update(id, updateData);
        toast.success('Product updated successfully');
      } else {
        await productService.create(data);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update product information' : 'Add a new product to inventory'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Product Name *</label>
              <input {...register('product_name', { required: 'Product name is required' })} className={`input-field ${errors.product_name ? 'input-error' : ''}`} placeholder="e.g. Wireless Headphones" />
              {errors.product_name && <p className="mt-1 text-xs text-red-600">{errors.product_name.message}</p>}
            </div>
            <div>
              <label className="label">SKU *</label>
              <div className="flex gap-2">
                <input {...register('sku', { required: 'SKU is required' })} className={`input-field ${errors.sku ? 'input-error' : ''}`} placeholder="e.g. PROD-001" />
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="btn-secondary whitespace-nowrap"
                >
                  Generate SKU
                </button>
              </div>
              {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category', { required: 'Category is required' })} className={`input-field ${errors.category ? 'input-error' : ''}`}>
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Unit Price (₹) *</label>
              <input type="number" step="0.01" {...register('unit_price', { required: 'Unit price is required', min: { value: 0, message: 'Price must be >= 0' } })} className={`input-field ${errors.unit_price ? 'input-error' : ''}`} placeholder="0.00" />
              {errors.unit_price && <p className="mt-1 text-xs text-red-600">{errors.unit_price.message}</p>}
            </div>
            {!isEdit && (
              <div>
                <label className="label">Initial Stock</label>
                <input type="number" {...register('current_stock', { min: 0 })} className="input-field" placeholder="0" />
              </div>
            )}
            <div>
              <label className="label">Minimum Stock Alert</label>
              <input type="number" {...register('minimum_stock', { min: 0 })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Warehouse Location</label>
              <input {...register('warehouse_location')} className="input-field" placeholder="e.g. A-1-01" />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input {...register('image_url')} className="input-field" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
