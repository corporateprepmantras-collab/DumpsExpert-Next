'use client';
import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setIsLoading(false); // Always hide loader after fetch
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/products?id=${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-1 rounded"
          />
          <button
            onClick={() => router.push('/dashboard/admin/product/list/add')}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Show spinner while loading
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              // Show empty message when no products
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              // Show products when data is loaded
              filtered.map((product, i) => (
                <tr key={product._id} className="text-center">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-12 w-12 object-cover mx-auto rounded"
                    />
                  </td>
                  <td className="p-2 border">{product.title}</td>
                  <td className="p-2 border">{product.dumpsPriceInr}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 text-white text-xs rounded ${
                      product.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-2 border space-x-1">
                    <button
                      onClick={() => router.push(`/dashboard/admin/product/list/edit/${product._id}`)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-pink-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/admin/product/${product._id}/faq`)}
                      className="bg-indigo-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Manage FAQ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;