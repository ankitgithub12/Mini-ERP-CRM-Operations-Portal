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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { current_stock: 0, minimum_stock: 0 },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setValue('image_url', '');
  };

  const handleGenerateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const autoSKU = `PROD-${timestamp}-${randomStr}`;
    setValue('sku', autoSKU, { shouldValidate: true });
    toast.success('SKU code generated');
  };

  useEffect(() => {
    if (isEdit) {
      productService.getById(id).then((res) => { 
        reset(res.data.data); 
        setPreviewUrl(res.data.data.image_url || '');
        setFetching(false); 
      }).catch(() => { 
        toast.error('Product not found'); 
        navigate('/products'); 
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      data.unit_price = parseFloat(data.unit_price);
      data.minimum_stock = parseInt(data.minimum_stock);
      if (!isEdit) data.current_stock = parseInt(data.current_stock || 0);

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
          const uploadRes = await productService.uploadImage(formData);
          data.image_url = uploadRes.data.data.url;
        } catch (uploadErr) {
          toast.error('Image upload failed, proceeding with default.');
          console.error(uploadErr);
        } finally {
          setUploading(false);
        }
      }

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
            <div className="sm:col-span-2 border-t border-gray-100 pt-4">
              <label className="label font-semibold text-gray-700">Product Image</label>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {previewUrl ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition opacity-90 hover:opacity-100"
                      title="Remove image"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs mt-1 font-medium">No image</span>
                  </div>
                )}
                
                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="btn-secondary text-sm cursor-pointer whitespace-nowrap bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition shadow-sm font-medium">
                      Upload from Local
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500 max-w-[200px] truncate">
                      {selectedFile ? selectedFile.name : 'No file chosen (Supports JPG, PNG)'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-400">OR PASTE URL</span>
                    </div>
                  </div>
                  <input
                    {...register('image_url')}
                    onChange={(e) => {
                      setValue('image_url', e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    className="input-field text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading || uploading} className="btn-primary">
            {(loading || uploading) ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? 'Uploading Image...' : 'Saving...'}</>
            ) : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
