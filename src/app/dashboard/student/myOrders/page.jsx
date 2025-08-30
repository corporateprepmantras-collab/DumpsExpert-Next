// app/student/orders/StudentOrders.jsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
// import OrderDetailsModal from "./OrderDetailsModal"; // adjust path if needed

const StudentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch all orders for the current user
        const res = await axios.get("/api/student/orders", {
          withCredentials: true,
        });

        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // Function to fetch a specific order when needed
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

  // Handle viewing order details
  const handleViewDetails = async (orderId) => {
    const orderDetails = await fetchOrderDetails(orderId);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order =>
        (order.orderNumber || "")
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }

    setCurrentPage(1);
  }, [searchQuery, orders]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="overflow-x-auto bg-white p-6 shadow rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">My Orders</h3>
        <input
          type="text"
          placeholder="Search Order Number..."
          className="border px-3 py-2 rounded-md w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="min-w-full text-sm border rounded-md">
        <thead className="bg-gray-200 text-left text-sm font-semibold">
          <tr>
            <th className="p-2 border">Sr. No.</th>
            <th className="p-2 border">Order Date</th>
            <th className="p-2 border">Order Number</th>
            <th className="p-2 border">Total (₹)</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Payment Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No orders found.
              </td>
            </tr>
          ) : (
            paginatedOrders.map((order, index) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="p-2 border">
                  {new Date(order.purchaseDate || order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border">{order.orderNumber || "-"}</td>
                <td className="p-2 border">₹{order.totalAmount}</td>
                <td className="p-2 border">{order.courseDetails.length}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      order.status === "completed" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleViewDetails(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center text-sm">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} entries
        </span>
        <div className="space-x-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default StudentOrders;
