"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaPlus } from "react-icons/fa";

const AdminGeneralFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get("/api/general-faqs", {
        withCredentials: true,
      });
      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/general-faqs", form, {
        withCredentials: true,
      });
      setFaqs((prev) => [...prev, res.data]);
      setForm({ question: "", answer: "" });
    } catch (error) {
      console.error("Error adding FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await axios.delete(`http://${process.env.NEXT_PUBLIC_BASE_URL}/api/general-faqs/${id}`, {
        withCredentials: true,
      });
      setFaqs((prev) => prev.filter((faq) => faq._id !== id));
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  if (fetching) {
    return <div className="text-center py-8">Loading FAQs...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Manage General FAQs
      </h1>

      <form
        onSubmit={handleAddFaq}
        className="bg-white p-4 rounded-md shadow mb-8 space-y-4"
      >
        <input
          type="text"
          name="question"
          placeholder="Enter question"
          value={form.question}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="answer"
          placeholder="Enter answer"
          value={form.answer}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          <FaPlus />
          Add FAQ
        </button>
      </form>

      {faqs.length === 0 ? (
        <p className="text-gray-500 text-center">No FAQs found.</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-gray-100 border rounded p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-black">{faq.question}</p>
                <p className="text-sm text-gray-700 mt-1">{faq.answer}</p>
              </div>
              <button
                onClick={() => handleDelete(faq._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGeneralFAQs;
