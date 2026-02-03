"use client";
// Import React and necessary hooks
import React, { useState, useEffect } from "react";
// Import Next.js router for navigation
import { useRouter, useParams } from "next/navigation";
// Import axios instance for API calls
import api from "axios";
import { Plus, Trash2, Link } from "lucide-react";

// Import the Multiple Image Uploader component
import ImageUploader from "@/components/dashboard/ImageUploader";
import RichTextEditor from "@/components/public/RichTextEditor";

// Main component for adding/editing questions
const QuestionForm = ({
  onSuccess,
  examId: propExamId,
  questionId: propQuestionId,
  isModal = false,
}) => {
  // Get route parameters
  const params = useParams();
  // Extract examId and questionId from params (or use prop)
  const examId = propExamId || params.examId;
  const questionId = propQuestionId || params.questionId;

  // Initialize router for navigation
  const router = useRouter();

  // State for form data
  const [formData, setFormData] = useState({
    questionText: "",
    questionCode: "",
    questionType: "radio",
    difficulty: "medium",
    marks: 1,
    negativeMarks: 0,
    subject: "",
    topic: "",
    tags: [],
    options: [
      { label: "A", text: "", images: [] },
      { label: "B", text: "", images: [] },
      { label: "C", text: "", images: [] },
      { label: "D", text: "", images: [] },
    ],
    correctAnswers: [],
    matchingPairs: {
      leftItems: [
        { id: "L1", text: "", images: [] },
        { id: "L2", text: "", images: [] },
      ],
      rightItems: [
        { id: "R1", text: "", images: [] },
        { id: "R2", text: "", images: [] },
      ],
      correctMatches: {},
    },
    isSample: false,
    explanation: "",
    status: "draft",
  });

  // State for image files (now arrays)
  const [questionImageFiles, setQuestionImageFiles] = useState([]);
  const [optionImageFiles, setOptionImageFiles] = useState({});
  const [matchingImageFiles, setMatchingImageFiles] = useState({});
  // State for pasted image URLs
  const [pastedImageUrls, setPastedImageUrls] = useState({});
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for tracking if we're editing an existing question
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState({});
  const [imageResetKey, setImageResetKey] = useState(0);

  // Function to reset form to initial state
  const resetForm = () => {
    setFormData({
      questionText: "",
      questionCode: "",
      questionType: "radio",
      difficulty: "medium",
      marks: 1,
      negativeMarks: 0,
      subject: "",
      topic: "",
      tags: [],
      options: [
        { label: "A", text: "", images: [] },
        { label: "B", text: "", images: [] },
        { label: "C", text: "", images: [] },
        { label: "D", text: "", images: [] },
      ],
      correctAnswers: [],
      matchingPairs: {
        leftItems: [
          { id: "L1", text: "", images: [] },
          { id: "L2", text: "", images: [] },
        ],
        rightItems: [
          { id: "R1", text: "", images: [] },
          { id: "R2", text: "", images: [] },
        ],
        correctMatches: {},
      },
      isSample: false,
      explanation: "",
      status: "draft",
    });
    setQuestionImageFiles([]);
    setOptionImageFiles({});
    setMatchingImageFiles({});
    setPastedImageUrls({});
    setImageResetKey((prev) => prev + 1);
  };

  // Effect to fetch question data when editing
  useEffect(() => {
    // Check if we're editing an existing question
    if (questionId && questionId !== "new") {
      setIsEditing(true);
      // Function to fetch question data
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          // API call to get question by ID
          const { data } = await api.get(`/api/questions/${questionId}`);

          if (data.success) {
            // Ensure options array has at least 4 items
            const options = data.data.options || [];
            while (options.length < 4) {
              options.push({
                label: String.fromCharCode(65 + options.length),
                text: "",
                images: [],
              });
            }

            // Clean up matchingPairs data if it exists
            let matchingPairs = {
              leftItems: [
                { id: "L1", text: "", images: [] },
                { id: "L2", text: "", images: [] },
              ],
              rightItems: [
                { id: "R1", text: "", images: [] },
                { id: "R2", text: "", images: [] },
              ],
              correctMatches: {},
            };

            if (data.data.matchingPairs) {
              const cleanLeftItems = (
                data.data.matchingPairs.leftItems || []
              ).map((item) => ({
                id: item.id,
                text: item.text || "",
                images: item.images || [],
              }));

              const cleanRightItems = (
                data.data.matchingPairs.rightItems || []
              ).map((item) => ({
                id: item.id,
                text: item.text || "",
                images: item.images || [],
              }));

              matchingPairs = {
                leftItems:
                  cleanLeftItems.length > 0
                    ? cleanLeftItems
                    : matchingPairs.leftItems,
                rightItems:
                  cleanRightItems.length > 0
                    ? cleanRightItems
                    : matchingPairs.rightItems,
                correctMatches: data.data.matchingPairs.correctMatches || {},
              };
            }

            // Update form state with the fetched data
            setFormData({
              questionText: data.data.questionText || "",
              questionCode: data.data.questionCode || "",
              questionType: data.data.questionType || "radio",
              difficulty: data.data.difficulty || "medium",
              marks: data.data.marks || 1,
              negativeMarks: data.data.negativeMarks || 0,
              subject: data.data.subject || "",
              topic: data.data.topic || "",
              tags: data.data.tags || [],
              options: options,
              correctAnswers: data.data.correctAnswers || [],
              matchingPairs: matchingPairs,
              isSample: data.data.isSample || false,
              explanation: data.data.explanation || "",
              status: data.data.status || "draft",
            });
          }
        } catch (err) {
          console.error("Failed to fetch question", err);
          alert("Failed to load question data");
        } finally {
          setLoading(false);
        }
      };

      fetchQuestion();
    } else {
      setIsEditing(false);
    }
  }, [questionId]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Function to handle option changes
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  // Function to handle correct answer selection
  const handleCorrectAnswerChange = (label) => {
    let updatedAnswers;
    if (formData.questionType === "radio") {
      updatedAnswers = [label];
    } else {
      updatedAnswers = formData.correctAnswers.includes(label)
        ? formData.correctAnswers.filter((a) => a !== label)
        : [...formData.correctAnswers, label];
    }
    setFormData((prev) => ({
      ...prev,
      correctAnswers: updatedAnswers,
    }));
  };

  const addMatchingItem = (side) => {
    const items =
      side === "left"
        ? formData.matchingPairs.leftItems
        : formData.matchingPairs.rightItems;
    const newId =
      side === "left" ? `L${items.length + 1}` : `R${items.length + 1}`;
    const newItem = { id: newId, text: "", images: [] };

    setFormData((prev) => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        [side === "left" ? "leftItems" : "rightItems"]: [...items, newItem],
      },
    }));
  };

  const removeMatchingItem = (side, index) => {
    const items =
      side === "left"
        ? formData.matchingPairs.leftItems
        : formData.matchingPairs.rightItems;
    if (items.length <= 2) {
      alert("Minimum 2 items required!");
      return;
    }

    const itemId = items[index].id;
    const updatedItems = items.filter((_, i) => i !== index);
    const updatedMatches = { ...formData.matchingPairs.correctMatches };

    if (side === "left") {
      delete updatedMatches[itemId];
    } else {
      Object.keys(updatedMatches).forEach((key) => {
        if (updatedMatches[key] === itemId) {
          delete updatedMatches[key];
        }
      });
    }

    setFormData((prev) => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        [side === "left" ? "leftItems" : "rightItems"]: updatedItems,
        correctMatches: updatedMatches,
      },
    }));
  };

  const handleMatchingItemChange = (side, index, field, value) => {
    const items =
      side === "left"
        ? [...formData.matchingPairs.leftItems]
        : [...formData.matchingPairs.rightItems];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        [side === "left" ? "leftItems" : "rightItems"]: items,
      },
    }));
  };

  // Handler for matching image uploads (multiple)
  const handleMatchingImagesSelect = (side, itemId, files) => {
    const key = `${side}-${itemId}`;
    setMatchingImageFiles((prev) => ({
      ...prev,
      [key]: files,
    }));
  };

  // Handler for pasted image URLs
  const handlePastedImageUrl = (key, url) => {
    if (!url.trim()) return;

    setPastedImageUrls((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), url.trim()],
    }));
  };

  const handleRemovePastedUrl = (key, urlIndex) => {
    setPastedImageUrls((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== urlIndex),
    }));
  };

  const handleCorrectMatchChange = (leftId, rightId) => {
    setFormData((prev) => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        correctMatches: {
          ...prev.matchingPairs.correctMatches,
          [leftId]: rightId,
        },
      },
    }));
  };

  // Handler for question images (multiple)
  const handleQuestionImagesSelect = (files) => {
    setQuestionImageFiles(files);
  };

  // Handler for option images (multiple)
  const handleOptionImagesSelect = (index, files) => {
    setOptionImageFiles((prev) => ({
      ...prev,
      [index]: files,
    }));
  };

  // Helper function to strip HTML and check if text is empty
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const isTextEmpty = (text) => {
    const cleaned = stripHtml(text);
    return !cleaned || cleaned.length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate question text
      if (isTextEmpty(formData.questionText)) {
        alert("Please enter question text");
        setLoading(false);
        return;
      }

      // Validate options for non-matching types
      if (formData.questionType !== "matching") {
        const emptyOptions = formData.options.filter((opt) =>
          isTextEmpty(opt.text),
        );
        if (emptyOptions.length > 0) {
          alert("Please fill in all option texts (A, B, C, D)");
          setLoading(false);
          return;
        }

        if (!formData.correctAnswers || formData.correctAnswers.length === 0) {
          alert("Please select at least one correct answer");
          setLoading(false);
          return;
        }
      }

      // Validate matching pairs if type is matching
      if (formData.questionType === "matching") {
        // Check if all matching items have text
        const emptyLeftItems = formData.matchingPairs.leftItems.filter((item) =>
          isTextEmpty(item.text),
        );
        const emptyRightItems = formData.matchingPairs.rightItems.filter(
          (item) => isTextEmpty(item.text),
        );

        if (emptyLeftItems.length > 0 || emptyRightItems.length > 0) {
          alert("Please fill in all matching items text fields");
          setLoading(false);
          return;
        }

        // Check if all matches are set
        const leftItemsCount = formData.matchingPairs.leftItems.length;
        const matchesCount = Object.keys(
          formData.matchingPairs.correctMatches,
        ).length;

        if (matchesCount < leftItemsCount) {
          alert("Please set correct matches for all items in Column A");
          setLoading(false);
          return;
        }
      }

      const submitData = new FormData();

      // Append basic form data
      submitData.append("examId", examId);
      submitData.append("questionText", formData.questionText);

      console.log("📝 FormData State:", {
        questionText: formData.questionText,
        options: formData.options,
        questionType: formData.questionType,
      });
      submitData.append("questionCode", formData.questionCode);
      submitData.append("questionType", formData.questionType);
      submitData.append("difficulty", formData.difficulty);
      submitData.append("marks", formData.marks.toString());
      submitData.append("negativeMarks", formData.negativeMarks.toString());
      submitData.append("subject", formData.subject);
      submitData.append("topic", formData.topic);
      submitData.append("tags", JSON.stringify(formData.tags));

      // Only send options and correctAnswers for non-matching types
      if (formData.questionType !== "matching") {
        submitData.append("options", JSON.stringify(formData.options));
        submitData.append(
          "correctAnswers",
          JSON.stringify(formData.correctAnswers),
        );
      }

      submitData.append("isSample", formData.isSample.toString());
      submitData.append("explanation", formData.explanation);
      submitData.append("status", formData.status);

      // Append multiple question images
      questionImageFiles.forEach((file) => {
        submitData.append("questionImages", file);
      });

      // Append multiple option images (only for non-matching types)
      if (formData.questionType !== "matching") {
        Object.entries(optionImageFiles).forEach(([index, files]) => {
          files.forEach((file) => {
            submitData.append(`optionImages-${index}`, file);
          });
        });
      }

      // Append matching type data if applicable
      if (formData.questionType === "matching") {
        submitData.append(
          "matchingPairs",
          JSON.stringify(formData.matchingPairs),
        );

        // Append matching images for each item
        formData.matchingPairs.leftItems.forEach((item) => {
          const key = `left-${item.id}`;
          const files = matchingImageFiles[key] || [];
          files.forEach((file) => {
            submitData.append(`matchingImages-left-${item.id}`, file);
          });

          // Append pasted URLs
          const pastedUrls = pastedImageUrls[key] || [];
          submitData.append(
            `pastedImages-left-${item.id}`,
            JSON.stringify(pastedUrls),
          );
        });

        formData.matchingPairs.rightItems.forEach((item) => {
          const key = `right-${item.id}`;
          const files = matchingImageFiles[key] || [];
          files.forEach((file) => {
            submitData.append(`matchingImages-right-${item.id}`, file);
          });

          // Append pasted URLs
          const pastedUrls = pastedImageUrls[key] || [];
          submitData.append(
            `pastedImages-right-${item.id}`,
            JSON.stringify(pastedUrls),
          );
        });
      }

      const url =
        isEditing && questionId !== "new"
          ? `/api/questions/${questionId}`
          : "/api/questions";

      const method = isEditing && questionId !== "new" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        alert(`Question ${isEditing ? "updated" : "created"} successfully!`);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Reset form after successful creation (not editing)
        if (!isEditing) {
          resetForm();
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching data
  if (loading && isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-lg">Loading question data...</div>
      </div>
    );
  }

  // Render component
  return (
    <div
      className={isModal ? "" : "max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen"}
    >
      <div className={isModal ? "" : "bg-white rounded-lg shadow-lg p-6"}>
        {!isModal && (
          <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
            {isEditing ? "Edit" : "Add"} Question
          </h1>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                1
              </span>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Code
                </label>
                <input
                  type="text"
                  name="questionCode"
                  value={formData.questionCode}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Q001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="radio">Single Choice (MCQ)</option>
                  <option value="checkbox">Multiple Choice</option>
                  <option value="matching">Matching Type</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <RichTextEditor
                label="Question Text *"
                value={formData.questionText}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, questionText: html }))
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Images (Optional - Multiple)
              </label>
              <ImageUploader
                resetKey={imageResetKey}
                onImagesSelect={handleQuestionImagesSelect}
              />
            </div>
          </div>

          {formData.questionType === "matching" ? (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  2
                </span>
                Matching Items
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-purple-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 text-lg">
                      Column A (Questions)
                    </h3>
                    <button
                      type="button"
                      onClick={() => addMatchingItem("left")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                    >
                      <Plus size={18} /> Add Item
                    </button>
                  </div>

                  {formData.matchingPairs.leftItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-full">
                          {item.id}
                        </span>
                        {formData.matchingPairs.leftItems.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMatchingItem("left", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <RichTextEditor
                        label=""
                        value={item.text}
                        onChange={(html) =>
                          handleMatchingItemChange("left", index, "text", html)
                        }
                      />

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Images (Multiple)
                        </label>
                        <ImageUploader
                          resetKey={imageResetKey}
                          onImagesSelect={(files) =>
                            handleMatchingImagesSelect("left", item.id, files)
                          }
                        />

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Or paste image URLs:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handlePastedImageUrl(
                                    `left-${item.id}`,
                                    e.target.value,
                                  );
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                          {pastedImageUrls[`left-${item.id}`]?.map(
                            (url, urlIndex) => (
                              <div
                                key={urlIndex}
                                className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded"
                              >
                                <img
                                  src={url}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span className="flex-1 text-xs truncate">
                                  {url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemovePastedUrl(
                                      `left-${item.id}`,
                                      urlIndex,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                          Correct Match:
                        </label>
                        <select
                          value={
                            formData.matchingPairs.correctMatches[item.id] || ""
                          }
                          onChange={(e) =>
                            handleCorrectMatchChange(item.id, e.target.value)
                          }
                          className="w-full p-2 border-2 border-purple-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select matching answer</option>
                          {formData.matchingPairs.rightItems.map(
                            (rightItem) => (
                              <option key={rightItem.id} value={rightItem.id}>
                                {rightItem.id} -{" "}
                                {rightItem.text.substring(0, 30)}
                                {rightItem.text.length > 30 ? "..." : ""}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-pink-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 text-lg">
                      Column B (Answers)
                    </h3>
                    <button
                      type="button"
                      onClick={() => addMatchingItem("right")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                    >
                      <Plus size={18} /> Add Item
                    </button>
                  </div>

                  {formData.matchingPairs.rightItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-4 p-4 border-2 border-pink-200 rounded-lg bg-pink-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-pink-700 bg-white px-3 py-1 rounded-full">
                          {item.id}
                        </span>
                        {formData.matchingPairs.rightItems.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMatchingItem("right", index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <RichTextEditor
                        label=""
                        value={item.text}
                        onChange={(html) =>
                          handleMatchingItemChange("right", index, "text", html)
                        }
                      />

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Images (Multiple)
                        </label>
                        <ImageUploader
                          resetKey={imageResetKey}
                          onImagesSelect={(files) =>
                            handleMatchingImagesSelect("right", item.id, files)
                          }
                        />

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Or paste image URLs:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handlePastedImageUrl(
                                    `right-${item.id}`,
                                    e.target.value,
                                  );
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>
                          {pastedImageUrls[`right-${item.id}`]?.map(
                            (url, urlIndex) => (
                              <div
                                key={urlIndex}
                                className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded"
                              >
                                <img
                                  src={url}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span className="flex-1 text-xs truncate">
                                  {url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemovePastedUrl(
                                      `right-${item.id}`,
                                      urlIndex,
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  2
                </span>
                Answer Options
              </h2>

              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border-2 border-green-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <span className="font-bold text-lg mr-4 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {option.label}
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type={
                          formData.questionType === "radio"
                            ? "radio"
                            : "checkbox"
                        }
                        name="correctAnswers"
                        checked={formData.correctAnswers.includes(option.label)}
                        onChange={() => handleCorrectAnswerChange(option.label)}
                        className="mr-2 w-5 h-5 text-green-500 focus:ring-green-500"
                      />
                      <span className="font-medium text-green-700">
                        Mark as Correct Answer
                      </span>
                    </label>
                  </div>

                  <div className="mb-3">
                    <RichTextEditor
                      label=""
                      value={option.text}
                      onChange={(html) =>
                        handleOptionChange(index, "text", html)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option Images (Optional - Multiple)
                    </label>
                    <ImageUploader
                      resetKey={imageResetKey}
                      onImagesSelect={(files) =>
                        handleOptionImagesSelect(index, files)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                3
              </span>
              Additional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negative Marks
                </label>
                <input
                  type="number"
                  name="negativeMarks"
                  value={formData.negativeMarks}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Algebra"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-gray-400 text-xs">(Optional)</span> -
                comma separated
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) => {
                  const tagsArray = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);
                  setFormData((prev) => ({ ...prev, tags: tagsArray }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., algebra, geometry, math"
              />
            </div>

            <div className="mb-4">
              <RichTextEditor
                label="Explanation (Optional)"
                value={formData.explanation}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, explanation: html }))
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isSample"
                  checked={formData.isSample}
                  onChange={handleInputChange}
                  className="mr-2 w-5 h-5 text-amber-500 focus:ring-amber-500"
                />
                <span className="font-medium text-gray-700">
                  Mark as Sample Question
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            {!isModal && (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            {isModal && !isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Form
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Question" : "Save & Continue"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
