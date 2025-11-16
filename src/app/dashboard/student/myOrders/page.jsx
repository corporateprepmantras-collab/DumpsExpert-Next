// app/dashboard/student/myOrders/page.jsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/student/orders", {
          withCredentials: true,
        });
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`/api/student/order/${orderId}`, {
        withCredentials: true,
      });
      return res.data.order;
    } catch (err) {
      console.error("Error fetching order details:", err);
      return null;
    }
  };

  const handleViewDetails = async (orderId) => {
    const orderDetails = await fetchOrderDetails(orderId);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        (order.orderNumber || "")
          .toString()
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500">
                  {filteredOrders.length} total orders
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Order Number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden space-y-4">
              {paginatedOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-semibold">No orders found</p>
                </div>
              ) : (
                paginatedOrders.map((order, index) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Order Number
                          </div>
                          <div className="font-bold text-gray-900">
                            {order.orderNumber || "-"}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Order Details */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(
                              order.purchaseDate || order.createdAt
                            ).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-semibold text-gray-900">
                            {order.courseDetails?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-blue-600 text-lg">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleViewDetails(order._id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (≥ 768px) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-600 font-semibold">
                              No orders found
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order, index) => (
                        <tr
                          key={order._id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(
                              order.purchaseDate || order.createdAt
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {order.orderNumber || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {order.paymentMethod || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">
                            ₹{order.totalAmount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.courseDetails?.length || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  order.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-orange-500"
                                }`}
                              ></span>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewDetails(order._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginatedOrders.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredOrders.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {filteredOrders.length}
                    </span>{" "}
                    entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        currentPage > 1 && setCurrentPage((prev) => prev - 1)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage((prev) => prev + 1)
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal - Integrated */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Order Details</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Order Number</div>
                  <div className="text-sm font-bold text-gray-900">
                    {selectedOrder.orderNumber || "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Order Date</div>
                  <div className="text-sm font-bold text-gray-900">
                    {new Date(
                      selectedOrder.purchaseDate || selectedOrder.createdAt
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                  <div className="text-lg font-bold text-blue-600">
                    ₹{selectedOrder.totalAmount}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Payment Status
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                      selectedOrder.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedOrder.status === "completed"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Courses Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">
                    Courses ({selectedOrder.courseDetails?.length || 0})
                  </h3>
                </div>

                <div className="space-y-3">
                  {selectedOrder.courseDetails?.map((course, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {idx + 1}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {course.title || course.name || "N/A"}
                            </h4>
                          </div>
                          {course.type && (
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                              {course.type}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500 mb-1">
                            Price
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            ₹{course.price || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOrders;
