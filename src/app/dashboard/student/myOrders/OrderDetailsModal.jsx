import React from "react";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Order Number:</strong> {order.orderNumber || "-"}
          </div>
          <div>
            <strong>Order Date:</strong>{" "}
            {new Date(order.purchaseDate || order.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Total Amount:</strong> ₹{order.totalAmount}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white text-xs ${
                order.status === "completed" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <strong>Quantity:</strong> {order.courseDetails?.length || 0}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Courses in this Order:</h3>
            <ul className="space-y-1 list-disc list-inside">
              {order.courseDetails?.map((course, idx) => (
                <li key={idx}>
                  <div>
                    <strong>Course Title:</strong> {course.title || "N/A"}
                  </div>
                  <div>
                    <strong>Price:</strong> ₹{course.price || "N/A"}
                  </div>
                  <hr className="my-2" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
