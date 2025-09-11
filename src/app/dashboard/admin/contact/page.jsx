"use client";

import React, { useEffect, useState } from "react";

const AdminContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold mb-6">📩 Contact Messages</h2>

      {messages.length === 0 ? (
        <p className="text-gray-600">No messages found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Subject</th>
                <th className="px-4 py-2 border">Message</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{msg.fullName}</td>
                  <td className="px-4 py-2 border">{msg.email}</td>
                  <td className="px-4 py-2 border">{msg.subject}</td>
                  <td className="px-4 py-2 border">{msg.message}</td>
                  <td className="px-4 py-2 border">
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
