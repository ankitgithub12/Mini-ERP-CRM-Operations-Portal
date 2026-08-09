import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { Plus, Eye, Edit, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;

      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage products and inventory</p>
        </div>
        {hasPermission('products', 'create') && (
          <Link to="/products/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <SearchFilter
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search by name or SKU..."
            filters={[
              { key: 'category', value: category, onChange: (v) => { setCategory(v); setPage(1); }, placeholder: 'All Categories', options: PRODUCT_CATEGORIES },
            ]}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" message="Try adjusting your search or filter criteria" />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.product_name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 flex-shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <p className="font-medium text-gray-900">{p.product_name}</p>
                        </div>
                      </td>
                      <td><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{p.sku}</span></td>
                      <td><span className="badge badge-info">{p.category}</span></td>
                      <td className="font-medium">{formatCurrency(p.unit_price)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${p.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                            {p.current_stock}
                          </span>
                          {p.is_low_stock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" title={`Below minimum stock (${p.minimum_stock})`} />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">Min: {p.minimum_stock}</p>
                      </td>
                      <td className="text-sm text-gray-500">{p.warehouse_location || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/products/${p.id}`} className="btn-icon" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {hasPermission('products', 'edit') && (
                            <Link to={`/products/${p.id}/edit`} className="btn-icon" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Link>
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
    </div>
  );
};

export default ProductList;
