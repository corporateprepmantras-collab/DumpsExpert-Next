"use client";

import { useState, useEffect } from "react";
import { FaChevronRight, FaQuestionCircle } from "react-icons/fa";
import axios from "axios";

export default function GeneralFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get("/api/general-faqs");
        setFaqs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 px-4 md:px-12 text-center">
        <p>Loading FAQs...</p>
      </section>
    );
  }

  if (faqs.length === 0) {
    return (
      <section className="w-full py-16 px-4 md:px-12 text-center">
        <p>No FAQs available.</p>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-br from-white to-gray-50 py-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 flex items-center justify-center gap-3">
          <FaQuestionCircle className="text-indigo-600" size={32} />
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left group focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-800">
                    {faq.question}
                  </span>
                  <FaChevronRight
                    className={`text-indigo-600 transition-transform duration-300 transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    size={18}
                  />
                </button>

                <div
                  className={`px-6 transition-all text-gray-700 text-sm ${
                    isOpen
                      ? "max-h-40 opacity-100 py-3"
                      : "max-h-0 opacity-0 py-0"
                  } overflow-hidden duration-300 ease-in-out`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
