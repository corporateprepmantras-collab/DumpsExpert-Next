'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BlogList = ({ searchTerm, currentCategory }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, currentCategory, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(currentCategory && { category: currentCategory })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBlogs(data.data);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return <div className="p-4">Loading blogs...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Image</th>
            <th className="px-4 py-2 border">Title</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog._id}>
              <td className="px-4 py-2 border">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-12 h-12 object-cover"
                />
              </td>
              <td className="px-4 py-2 border">{blog.title}</td>
              <td className="px-4 py-2 border">{blog.category}</td>
              <td className="px-4 py-2 border">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    blog.status === 'publish'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {blog.status}
                </span>
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => onEdit(blog)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="mx-1 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="mx-1 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;