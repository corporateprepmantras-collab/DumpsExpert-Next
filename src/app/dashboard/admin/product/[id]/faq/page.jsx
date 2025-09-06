'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';

const ManageFaq = () => {
  const { id } = useParams();
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editFaq, setEditFaq] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [id]);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`/api/faqs?productId=${id}`);
      setFaqs(res.data.faqs || []);
    } catch (err) {
      setError('Failed to load FAQs');
    }
  };

  const handleAddFaq = async () => {
    if (!question || !answer) {
      setError('Both question and answer are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/faqs', { productId: id, question, answer });
      setQuestion('');
      setAnswer('');
      setError('');
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFaq = async () => {
    if (!editFaq || !question || !answer) {
      setError('Both question and answer are required');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/faqs', {
        productId: id,
        faqId: editFaq._id,
        question,
        answer
      });
      setEditFaq(null);
      setQuestion('');
      setAnswer('');
      setError('');
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!confirm('Delete this FAQ?')) return;
    
    try {
      await axios.delete(`/api/faqs?productId=${id}&faqId=${faqId}`);
      fetchFaqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleCancelEdit = () => {
    setEditFaq(null);
    setQuestion('');
    setAnswer('');
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Manage FAQs</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          rows={3}
        ></textarea>
        <div className="flex gap-2">
          {editFaq ? (
            <>
              <button
                onClick={handleUpdateFaq}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Updating...' : 'Update FAQ'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddFaq}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Adding...' : 'Add FAQ'}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Existing FAQs</h3>
        {faqs.length === 0 ? (
          <p className="text-gray-500">No FAQs yet for this product.</p>
        ) : (
          <ul className="space-y-3">
            {faqs.map((faq, index) => (
              <li key={faq._id} className="border p-3 rounded flex justify-between items-start">
                <div>
                  <p className="font-semibold">Q: {faq.question}</p>
                  <p className="text-gray-700">A: {faq.answer}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageFaq;