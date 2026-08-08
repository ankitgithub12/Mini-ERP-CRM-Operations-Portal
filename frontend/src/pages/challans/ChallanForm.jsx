import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challanService } from '../../services/challanService';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import { ArrowLeft, Plus, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ChallanForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getAll({ limit: 100 }),
        productService.getAll({ limit: 100 }),
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const addProduct = (product) => {
    if (items.find((i) => i.product_id === product.id)) {
      return toast.error('Product already added');
    }
    setItems([...items, {
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: product.unit_price,
      current_stock: product.current_stock,
      quantity: 1,
    }]);
    setShowProductSearch(false);
    setProductSearch('');
  };

  const updateQuantity = (index, qty) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, parseInt(qty) || 1);
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);

  const handleSubmit = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (items.length === 0) return toast.error('Please add at least one product');

    setLoading(true);
    try {
      await challanService.create({
        customer_id: selectedCustomer,
        status: 'DRAFT',
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      toast.success('Challan created as DRAFT');
      navigate('/challans');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.business_name || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    (p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())) &&
    !items.find((i) => i.product_id === p.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="page-title">Create Sales Challan</h1>
          <p className="page-subtitle">Create a new delivery challan</p>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="card">
        <div className="card-header"><h3 className="text-base font-semibold text-gray-900">1. Select Customer</h3></div>
        <div className="card-body">
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="input-field"
          >
            <option value="">-- Select a customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name}{c.business_name ? ` (${c.business_name})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Selection */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">2. Add Products</h3>
          <button onClick={() => setShowProductSearch(true)} className="btn-secondary btn-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Product Search Dropdown */}
        {showProductSearch && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="input-field pl-10"
                placeholder="Search products by name or SKU..."
                autoFocus
              />
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {filteredProducts.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 text-center">No products found</p>
              ) : (
                filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.product_name}</p>
                      <p className="text-xs text-gray-500">SKU: {p.sku} | Stock: {p.current_stock}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(p.unit_price)}</span>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => { setShowProductSearch(false); setProductSearch(''); }} className="mt-2 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        )}

        {/* Items Table */}
        {items.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Available</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.product_id}>
                    <td className="font-medium text-gray-900">{item.product_name}</td>
                    <td><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{item.sku}</span></td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>
                      <span className={item.current_stock < item.quantity ? 'text-red-600 font-medium' : ''}>
                        {item.current_stock}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                        className="input-field w-20 text-center"
                      />
                    </td>
                    <td className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</td>
                    <td>
                      <button onClick={() => removeItem(index)} className="btn-icon text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">No products added yet. Click &quot;Add Product&quot; to start.</div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-xl font-bold text-gray-900">{totalQuantity} items</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-primary-600">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
};

export default ChallanForm;
