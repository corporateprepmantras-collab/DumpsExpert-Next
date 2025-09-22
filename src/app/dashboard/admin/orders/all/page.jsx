"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const OrdersAll = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/order", {
        withCredentials: true,
      });

      console.log("API Response:", res.data);

      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (error.response?.status === 401) {
        setError("Please log in to view orders.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view orders.");
      } else {
        setError("Failed to fetch orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrders = async () => {
    try {
      setIsDeleting(true);
      
      const response = await axios.delete("/api/order", {
        data: { orderIds: selectedOrders },
        withCredentials: true,
      });

      if (response.data.success) {
        // Remove deleted orders from state
        setOrders(prevOrders => 
          prevOrders.filter(order => !selectedOrders.includes(order._id))
        );
        setSelectedOrders([]);
        setShowDeleteConfirm(false);
        
        // Show success message
        alert(`${response.data.deletedCount} order(s) deleted successfully`);
      }
    } catch (error) {
      console.error("Failed to delete orders:", error);
      alert("Failed to delete orders. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order._id));
    }
  };

  // Filter orders based on search query + date range
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;

    const query = searchQuery.toLowerCase();
    const orderNumber = order.orderNumber?.toString().toLowerCase() || "";
    const customerName = order.user?.name?.toLowerCase() || "";
    const customerEmail = order.user?.email?.toLowerCase() || "";

    // Date filtering
    const orderDate = new Date(order.purchaseDate || order.createdAt);
    let isWithinDate = true;

    if (startDate) {
      isWithinDate = orderDate >= new Date(startDate);
    }
    if (endDate && isWithinDate) {
      isWithinDate = orderDate <= new Date(endDate);
    }
//updated sruff
    return (
      isWithinDate &&
      (orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query))
    );
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
      setSelectedOrders([]); // Clear selection when changing pages
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">All Orders</h2>

        <div className="flex flex-wrap gap-2">
          {/* Date Range Selectors */}
          <input
            type="date"
            className="px-3 py-2 border rounded-md"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <span className="self-center">to</span>
          <input
            type="date"
            className="px-3 py-2 border rounded-md"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search orders..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Delete Actions */}
      {selectedOrders.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-red-700">
              {selectedOrders.length} order(s) selected
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

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
                  <th className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
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
                      <td className="px-4 py-2 border">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        {order.orderNumber || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {order.user?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {order.user?.email || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {order.courseDetails?.map((c, idx) => (
                          <div key={idx} className="mb-1 text-sm">
                            {c.name} - ₹{c.price?.toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-2 border">
                        {new Date(
                          order.purchaseDate || order.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded text-white text-xs ${
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "pending"
                              ? "bg-yellow-500"
                              : order.status === "rejected"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        >
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
                    <td
                      colSpan="8"
                      className="text-center py-4 text-gray-500"
                    >
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredOrders.length
                )}{" "}
                of {filteredOrders.length} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => {
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
                          currentPage === pageNum
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        } hover:bg-gray-300`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedOrders.length} order(s)? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrders}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAll;