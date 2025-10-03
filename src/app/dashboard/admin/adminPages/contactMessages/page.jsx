"use client";

import { useEffect, useState } from "react";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (res.ok) setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) return <p className="text-center py-10">Loading messages...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Full Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg._id} className="text-center">
                <td className="p-2 border">{msg.fullName}</td>
                <td className="p-2 border">{msg.email}</td>
                <td className="p-2 border">{msg.subject}</td>
                <td className="p-2 border truncate max-w-[200px]">
                  {msg.message.length > 30
                    ? msg.message.slice(0, 30) + "..."
                    : msg.message}
                </td>
                <td className="p-2 border">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => setSelected(msg)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full shadow-lg relative">
            <h3 className="text-xl font-semibold mb-2">{selected.subject}</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>From:</strong> {selected.fullName} ({selected.email})
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Date:</strong>{" "}
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-800 whitespace-pre-line">{selected.message}</p>
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
