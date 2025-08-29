"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const OrdersAll = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get("/api/order", {
        withCredentials: true
      });

      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const orderNumber = order.orderNumber?.toString().toLowerCase() || "";
    const customerName = order.user?.name?.toLowerCase() || "";
    const customerEmail = order.user?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return orderNumber.includes(query) || 
           customerName.includes(query) || 
           customerEmail.includes(query);
  });

  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">All Orders</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Order #</th>
                  <th className="px-4 py-2 border">Customer</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Courses</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{order.orderNumber || "N/A"}</td>
                      <td className="px-4 py-2 border">{order.user?.name || "N/A"}</td>
                      <td className="px-4 py-2 border">{order.user?.email || "N/A"}</td>
                      <td className="px-4 py-2 border">
                        {order.courseDetails?.map((c, idx) => (
                          <div key={idx} className="mb-1">
                            {c.name} - ₹{c.price?.toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-2 border">
                        {new Date(order.purchaseDate || order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          order.status === "completed" ? "bg-green-500" : 
                          order.status === "pending" ? "bg-yellow-500" : 
                          order.status === "rejected" ? "bg-red-500" : "bg-gray-500"
                        }`}>
                          {order.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        ₹{order.totalAmount?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum ? "bg-blue-500 text-white" : "bg-gray-200"
                      } hover:bg-gray-300`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersAll;
