"use client";
// Import React and necessary hooks
import React, { useState, useEffect } from "react";
// Import Next.js router for navigation
import { useRouter, useParams } from "next/navigation";
// Import axios instance for API calls
import api from "axios";
import { Plus, Trash2, Upload, Link } from "lucide-react";

// Main component for adding/editing questions
const QuestionForm = () => {
  // Get route parameters
  const params = useParams();
  // Extract examId and questionId from params
  const examId = params.examId;
  const questionId = params.questionId;
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
      { label: "A", text: "", image: "" },
      { label: "B", text: "", image: "" },
      { label: "C", text: "", image: "" },
      { label: "D", text: "", image: "" },
    ],
    correctAnswers: [],
    matchingPairs: {
      leftItems: [
        { id: "L1", text: "", image: "", imageUrl: "" },
        { id: "L2", text: "", image: "", imageUrl: "" },
      ],
      rightItems: [
        { id: "R1", text: "", image: "", imageUrl: "" },
        { id: "R2", text: "", image: "", imageUrl: "" },
      ],
      correctMatches: {},
    },
    isSample: false,
    explanation: "",
    status: "draft",
  });

  // State for image files
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [optionImageFiles, setOptionImageFiles] = useState({});
  const [matchingImageFiles, setMatchingImageFiles] = useState({});
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for preview images
  const [previewImages, setPreviewImages] = useState({});
  // State for tracking if we're editing an existing question
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState({});

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
          // Update form data with fetched question
          if (data.success) {
            // Ensure options array has at least 4 items
            const options = data.data.options || [];
            while (options.length < 4) {
              options.push({
                label: String.fromCharCode(65 + options.length),
                text: "",
                image: "",
              });
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
              isSample: data.data.isSample || false,
              explanation: data.data.explanation || "",
              status: data.data.status || "draft",
            });

            // Set preview images for existing images
            if (data.data.questionImage) {
              setPreviewImages((prev) => ({
                ...prev,
                question: data.data.questionImage,
              }));
            }

            // Set preview images for option images
            data.data.options?.forEach((option, index) => {
              if (option.image) {
                setPreviewImages((prev) => ({
                  ...prev,
                  [`option-${index}`]: option.image,
                }));
              }
            });
          }
        } catch (err) {
          // Log error
          console.error("Failed to fetch question", err);
          alert("Failed to load question data");
        } finally {
          setLoading(false);
        }
      };

      // Call fetch function
      fetchQuestion();
    } else {
      setIsEditing(false);
    }
  }, [questionId]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Update form data based on input type
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Function to handle option changes
  const handleOptionChange = (index, field, value) => {
    // Create updated options array
    const updatedOptions = [...formData.options];
    // Update specific option field
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    // Update form data with new options
    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  // Function to handle correct answer selection
  const handleCorrectAnswerChange = (label) => {
    // Create updated correct answers array
    let updatedAnswers;
    if (formData.questionType === "radio") {
      // For radio, only one correct answer
      updatedAnswers = [label];
    } else {
      // For checkbox, toggle selection
      updatedAnswers = formData.correctAnswers.includes(label)
        ? formData.correctAnswers.filter((a) => a !== label)
        : [...formData.correctAnswers, label];
    }
    // Update form data with new correct answers
    setFormData((prev) => ({
      ...prev,
      correctAnswers: updatedAnswers,
    }));
  };
    const addMatchingItem = (side) => {
    const items = side === "left" ? formData.matchingPairs.leftItems : formData.matchingPairs.rightItems;
    const newId = side === "left" ? `L${items.length + 1}` : `R${items.length + 1}`;
    const newItem = { id: newId, text: "", image: "", imageUrl: "" };
    
    setFormData((prev) => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        [side === "left" ? "leftItems" : "rightItems"]: [...items, newItem],
      },
    }));
  };

  const removeMatchingItem = (side, index) => {
    const items = side === "left" ? formData.matchingPairs.leftItems : formData.matchingPairs.rightItems;
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
      Object.keys(updatedMatches).forEach(key => {
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
    const items = side === "left" ? [...formData.matchingPairs.leftItems] : [...formData.matchingPairs.rightItems];
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

  const handleMatchingImageUpload = (side, index, e) => {
    const file = e.target.files[0];
    if (file) {
      const key = `${side}-${index}`;
      setMatchingImageFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
      const previewUrl = URL.createObjectURL(file);
      setPreviewImages((prev) => ({
        ...prev,
        [`matching-${key}`]: previewUrl,
      }));
    }
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

  // Function to handle image upload for question
  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set question image file
      setQuestionImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      // Update preview images
      setPreviewImages((prev) => ({
        ...prev,
        question: previewUrl,
      }));
    }
  };

  // Function to handle image upload for options
  const handleOptionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Update option image files
      setOptionImageFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      // Update preview images
      setPreviewImages((prev) => ({
        ...prev,
        [`option-${index}`]: previewUrl,
      }));
    }
  };

  // Function to handle form submission
  // const handleSubmit = async (e) => {
  //   // Prevent default form submission
  //   e.preventDefault();
  //   // Set loading state
  //   setLoading(true);

  //   try {
  //     // Create FormData object for file uploads
  //     const submitData = new FormData();
  //     // Append all form fields to FormData
  //     Object.keys(formData).forEach((key) => {
  //       if (key === "options" || key === "correctAnswers" || key === "tags") {
  //         // Stringify arrays for form data
  //         submitData.append(key, JSON.stringify(formData[key]));
  //       } else {
  //         // Append other fields directly
  //         submitData.append(key, formData[key]);
  //       }
  //     });

  //     // Append exam ID to form data
  //     submitData.append("examId", examId);

  //     // Append question image if selected
  //     if (questionImageFile) {
  //       submitData.append("questionImage", questionImageFile);
  //     }

  //     // Append option images if selected
  //     Object.keys(optionImageFiles).forEach((index) => {
  //       submitData.append(`optionImage-${index}`, optionImageFiles[index]);
  //     });

  //     // Determine API endpoint and method based on edit or add
  //     let response;
  //     if (isEditing) {
  //       // For editing existing question
  //       submitData.append("_id", questionId);
  //       response = await api.put(`/api/questions/${questionId}`, submitData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });
  //     } else {
  //       // For adding new question
  //       response = await api.post("/api/questions", submitData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });
  //     }

  //     // Check if API call was successful
  //     if (response.data.success) {
  //       // Navigate back to questions list
  //       router.push(`/dashboard/admin/exam/${examId}/questions`);
  //       router.refresh(); // Refresh the page to see updated data
  //     } else {
  //       // Show error message
  //       alert(response.data.message || "Operation failed");
  //     }
  //   } catch (err) {
  //     // Log error and show alert
  //     console.error("Operation failed", err);
  //     alert(
  //       "Operation failed: " + (err.response?.data?.message || err.message)
  //     );
  //   } finally {
  //     // Reset loading state
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append basic form data
      submitData.append('examId', examId);
      submitData.append('questionText', formData.questionText);
      submitData.append('questionCode', formData.questionCode);
      submitData.append('questionType', formData.questionType);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('marks', formData.marks.toString());
      submitData.append('negativeMarks', formData.negativeMarks.toString());
      submitData.append('subject', formData.subject);
      submitData.append('topic', formData.topic);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('options', JSON.stringify(formData.options));
      submitData.append('correctAnswers', JSON.stringify(formData.correctAnswers));
      submitData.append('isSample', formData.isSample.toString());
      submitData.append('explanation', formData.explanation);
      submitData.append('status', formData.status);

      // Append question image if exists
      if (questionImageFile) {
        submitData.append('questionImage', questionImageFile);
      }

      // Append option images
      Object.entries(optionImageFiles).forEach(([index, file]) => {
        submitData.append(`optionImage-${index}`, file);
      });

      // Append matching type data if applicable
      if (formData.questionType === 'matching') {
        submitData.append('matchingPairs', JSON.stringify(formData.matchingPairs));
        
        // Append matching images
        Object.entries(matchingImageFiles).forEach(([key, file]) => {
          submitData.append(`matchingImage-${key}`, file);
        });
      }

      const url = isEditing && questionId !== 'new' 
        ? `/api/questions/${questionId}`
        : '/api/questions';

      const method = isEditing && questionId !== 'new' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData,
      });
     console.log(submitData);
      const result = await response.json();
 
      if (result.success) {
        alert(`Question ${isEditing ? 'updated' : 'created'} successfully!`);
        if (!isEditing) {
          // Reset form after successful creation
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
              { label: "A", text: "", image: "" },
              { label: "B", text: "", image: "" },
              { label: "C", text: "", image: "" },
              { label: "D", text: "", image: "" },
            ],
            correctAnswers: [],
            matchingPairs: {
              leftItems: [
                { id: "L1", text: "", image: "", imageUrl: "" },
                { id: "L2", text: "", image: "", imageUrl: "" },
              ],
              rightItems: [
                { id: "R1", text: "", image: "", imageUrl: "" },
                { id: "R2", text: "", image: "", imageUrl: "" },
              ],
              correctMatches: {},
            },
            isSample: false,
            explanation: "",
            status: "draft",
          });
          setQuestionImageFile(null);
          setOptionImageFiles({});
          setMatchingImageFiles({});
          setPreviewImages({});
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit question. Please try again.');
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
          {isEditing ? "Edit" : "Add"} Question
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleQuestionImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {previewImages.question && (
                <div className="mt-3">
                  <img
                    src={previewImages.question}
                    alt="Question preview"
                    className="h-40 object-contain border-2 border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {formData.questionType === "matching" ? (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                Matching Items
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-purple-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 text-lg">Column A (Questions)</h3>
                    <button
                      type="button"
                      onClick={() => addMatchingItem("left")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                    >
                      <Plus size={18} /> Add Item
                    </button>
                  </div>
                  
                  {formData.matchingPairs.leftItems.map((item, index) => (
                    <div key={item.id} className="mb-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-full">{item.id}</span>
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
                      
                      <textarea
                        value={item.text}
                        onChange={(e) => handleMatchingItemChange("left", index, "text", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="2"
                        placeholder="Enter question text..."
                      />
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setImageUploadMode(prev => ({
                              ...prev,
                              [`left-${index}`]: imageUploadMode[`left-${index}`] === 'file' ? '' : 'file'
                            }))}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              imageUploadMode[`left-${index}`] === 'file' 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Upload size={16} /> Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUploadMode(prev => ({
                              ...prev,
                              [`left-${index}`]: imageUploadMode[`left-${index}`] === 'url' ? '' : 'url'
                            }))}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              imageUploadMode[`left-${index}`] === 'url' 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Link size={16} /> Image URL
                          </button>
                        </div>
                        
                        {imageUploadMode[`left-${index}`] === 'file' && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMatchingImageUpload("left", index, e)}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                          />
                        )}
                        
                        {imageUploadMode[`left-${index}`] === 'url' && (
                          <input
                            type="url"
                            value={item.imageUrl || ''}
                            onChange={(e) => handleMatchingItemChange("left", index, "imageUrl", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                          />
                        )}
                        
                        {(previewImages[`matching-left-${index}`] || item.imageUrl) && (
                          <img
                            src={previewImages[`matching-left-${index}`] || item.imageUrl}
                            alt={`Left ${item.id}`}
                            className="w-full h-32 object-contain border-2 border-purple-300 rounded-lg bg-white p-2"
                          />
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                          Correct Match:
                        </label>
                        <select
                          value={formData.matchingPairs.correctMatches[item.id] || ""}
                          onChange={(e) => handleCorrectMatchChange(item.id, e.target.value)}
                          className="w-full p-2 border-2 border-purple-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select matching answer</option>
                          {formData.matchingPairs.rightItems.map((rightItem) => (
                            <option key={rightItem.id} value={rightItem.id}>
                              {rightItem.id} - {rightItem.text.substring(0, 30)}{rightItem.text.length > 30 ? '...' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-pink-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 text-lg">Column B (Answers)</h3>
                    <button
                      type="button"
                      onClick={() => addMatchingItem("right")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                    >
                      <Plus size={18} /> Add Item
                    </button>
                  </div>
                  
                  {formData.matchingPairs.rightItems.map((item, index) => (
                    <div key={item.id} className="mb-4 p-4 border-2 border-pink-200 rounded-lg bg-pink-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-pink-700 bg-white px-3 py-1 rounded-full">{item.id}</span>
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
                      
                      <textarea
                        value={item.text}
                        onChange={(e) => handleMatchingItemChange("right", index, "text", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        rows="2"
                        placeholder="Enter answer text..."
                      />
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setImageUploadMode(prev => ({
                              ...prev,
                              [`right-${index}`]: imageUploadMode[`right-${index}`] === 'file' ? '' : 'file'
                            }))}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              imageUploadMode[`right-${index}`] === 'file' 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Upload size={16} /> Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUploadMode(prev => ({
                              ...prev,
                              [`right-${index}`]: imageUploadMode[`right-${index}`] === 'url' ? '' : 'url'
                            }))}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              imageUploadMode[`right-${index}`] === 'url' 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Link size={16} /> Image URL
                          </button>
                        </div>
                        
                        {imageUploadMode[`right-${index}`] === 'file' && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMatchingImageUpload("right", index, e)}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                          />
                        )}
                        
                        {imageUploadMode[`right-${index}`] === 'url' && (
                          <input
                            type="url"
                            value={item.imageUrl || ''}
                            onChange={(e) => handleMatchingItemChange("right", index, "imageUrl", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                          />
                        )}
                        
                        {(previewImages[`matching-right-${index}`] || item.imageUrl) && (
                          <img
                            src={previewImages[`matching-right-${index}`] || item.imageUrl}
                            alt={`Right ${item.id}`}
                            className="w-full h-32 object-contain border-2 border-pink-300 rounded-lg bg-white p-2"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                Answer Options
              </h2>

              {formData.options.map((option, index) => (
                <div key={index} className="mb-4 p-4 border-2 border-green-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <span className="font-bold text-lg mr-4 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {option.label}
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type={formData.questionType === "radio" ? "radio" : "checkbox"}
                        name="correctAnswers"
                        checked={formData.correctAnswers.includes(option.label)}
                        onChange={() => handleCorrectAnswerChange(option.label)}
                        className="mr-2 w-5 h-5 text-green-500 focus:ring-green-500"
                      />
                      <span className="font-medium text-green-700">Mark as Correct Answer</span>
                    </label>
                  </div>

                  <div className="mb-3">
                    <textarea
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="2"
                      placeholder={`Enter option ${option.label} text...`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionImageChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                    {previewImages[`option-${index}`] && (
                      <div className="mt-3">
                        <img
                          src={previewImages[`option-${index}`]}
                          alt={`Option ${option.label} preview`}
                          className="h-32 object-contain border-2 border-green-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
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
                  Subject
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
                  Topic
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
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) => {
                  const tagsArray = e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag);
                  setFormData((prev) => ({ ...prev, tags: tagsArray }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., algebra, geometry, math"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explanation
              </label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows="3"
                placeholder="Provide explanation for the correct answer..."
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
                <span className="font-medium text-gray-700">Mark as Sample Question</span>
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
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
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
                <>
                  {isEditing ? "Update Question" : "Create Question"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;


// "use client";
// import React, { useState } from "react";
// import { Plus, Trash2, Upload, Link } from "lucide-react";

// const QuestionForm = () => {
//   const examId = "exam123";
//   const questionId = "new";
  
//   const [formData, setFormData] = useState({
//     questionText: "",
//     questionCode: "",
//     questionType: "radio",
//     difficulty: "medium",
//     marks: 1,
//     negativeMarks: 0,
//     subject: "",
//     topic: "",
//     tags: [],
//     options: [
//       { label: "A", text: "", image: "" },
//       { label: "B", text: "", image: "" },
//       { label: "C", text: "", image: "" },
//       { label: "D", text: "", image: "" },
//     ],
//     correctAnswers: [],
//     matchingPairs: {
//       leftItems: [
//         { id: "L1", text: "", image: "", imageUrl: "" },
//         { id: "L2", text: "", image: "", imageUrl: "" },
//       ],
//       rightItems: [
//         { id: "R1", text: "", image: "", imageUrl: "" },
//         { id: "R2", text: "", image: "", imageUrl: "" },
//       ],
//       correctMatches: {},
//     },
//     isSample: false,
//     explanation: "",
//     status: "draft",
//   });

//   const [questionImageFile, setQuestionImageFile] = useState(null);
//   const [optionImageFiles, setOptionImageFiles] = useState({});
//   const [matchingImageFiles, setMatchingImageFiles] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [previewImages, setPreviewImages] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [imageUploadMode, setImageUploadMode] = useState({});

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleOptionChange = (index, field, value) => {
//     const updatedOptions = [...formData.options];
//     updatedOptions[index] = {
//       ...updatedOptions[index],
//       [field]: value,
//     };
//     setFormData((prev) => ({
//       ...prev,
//       options: updatedOptions,
//     }));
//   };

//   const handleCorrectAnswerChange = (label) => {
//     let updatedAnswers;
//     if (formData.questionType === "radio") {
//       updatedAnswers = [label];
//     } else {
//       updatedAnswers = formData.correctAnswers.includes(label)
//         ? formData.correctAnswers.filter((a) => a !== label)
//         : [...formData.correctAnswers, label];
//     }
//     setFormData((prev) => ({
//       ...prev,
//       correctAnswers: updatedAnswers,
//     }));
//   };

//   const addMatchingItem = (side) => {
//     const items = side === "left" ? formData.matchingPairs.leftItems : formData.matchingPairs.rightItems;
//     const newId = side === "left" ? `L${items.length + 1}` : `R${items.length + 1}`;
//     const newItem = { id: newId, text: "", image: "", imageUrl: "" };
    
//     setFormData((prev) => ({
//       ...prev,
//       matchingPairs: {
//         ...prev.matchingPairs,
//         [side === "left" ? "leftItems" : "rightItems"]: [...items, newItem],
//       },
//     }));
//   };

//   const removeMatchingItem = (side, index) => {
//     const items = side === "left" ? formData.matchingPairs.leftItems : formData.matchingPairs.rightItems;
//     if (items.length <= 2) {
//       alert("Minimum 2 items required!");
//       return;
//     }
    
//     const itemId = items[index].id;
//     const updatedItems = items.filter((_, i) => i !== index);
//     const updatedMatches = { ...formData.matchingPairs.correctMatches };
    
//     if (side === "left") {
//       delete updatedMatches[itemId];
//     } else {
//       Object.keys(updatedMatches).forEach(key => {
//         if (updatedMatches[key] === itemId) {
//           delete updatedMatches[key];
//         }
//       });
//     }
    
//     setFormData((prev) => ({
//       ...prev,
//       matchingPairs: {
//         ...prev.matchingPairs,
//         [side === "left" ? "leftItems" : "rightItems"]: updatedItems,
//         correctMatches: updatedMatches,
//       },
//     }));
//   };

//   const handleMatchingItemChange = (side, index, field, value) => {
//     const items = side === "left" ? [...formData.matchingPairs.leftItems] : [...formData.matchingPairs.rightItems];
//     items[index] = {
//       ...items[index],
//       [field]: value,
//     };
    
//     setFormData((prev) => ({
//       ...prev,
//       matchingPairs: {
//         ...prev.matchingPairs,
//         [side === "left" ? "leftItems" : "rightItems"]: items,
//       },
//     }));
//   };

//   const handleMatchingImageUpload = (side, index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const key = `${side}-${index}`;
//       setMatchingImageFiles((prev) => ({
//         ...prev,
//         [key]: file,
//       }));
//       const previewUrl = URL.createObjectURL(file);
//       setPreviewImages((prev) => ({
//         ...prev,
//         [`matching-${key}`]: previewUrl,
//       }));
//     }
//   };

//   const handleCorrectMatchChange = (leftId, rightId) => {
//     setFormData((prev) => ({
//       ...prev,
//       matchingPairs: {
//         ...prev.matchingPairs,
//         correctMatches: {
//           ...prev.matchingPairs.correctMatches,
//           [leftId]: rightId,
//         },
//       },
//     }));
//   };

//   const handleQuestionImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setQuestionImageFile(file);
//       const previewUrl = URL.createObjectURL(file);
//       setPreviewImages((prev) => ({
//         ...prev,
//         question: previewUrl,
//       }));
//     }
//   };

//   const handleOptionImageChange = (index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setOptionImageFiles((prev) => ({
//         ...prev,
//         [index]: file,
//       }));
//       const previewUrl = URL.createObjectURL(file);
//       setPreviewImages((prev) => ({
//         ...prev,
//         [`option-${index}`]: previewUrl,
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const submitData = new FormData();
      
//       // Append basic form data
//       submitData.append('examId', examId);
//       submitData.append('questionText', formData.questionText);
//       submitData.append('questionCode', formData.questionCode);
//       submitData.append('questionType', formData.questionType);
//       submitData.append('difficulty', formData.difficulty);
//       submitData.append('marks', formData.marks.toString());
//       submitData.append('negativeMarks', formData.negativeMarks.toString());
//       submitData.append('subject', formData.subject);
//       submitData.append('topic', formData.topic);
//       submitData.append('tags', JSON.stringify(formData.tags));
//       submitData.append('options', JSON.stringify(formData.options));
//       submitData.append('correctAnswers', JSON.stringify(formData.correctAnswers));
//       submitData.append('isSample', formData.isSample.toString());
//       submitData.append('explanation', formData.explanation);
//       submitData.append('status', formData.status);

//       // Append question image if exists
//       if (questionImageFile) {
//         submitData.append('questionImage', questionImageFile);
//       }

//       // Append option images
//       Object.entries(optionImageFiles).forEach(([index, file]) => {
//         submitData.append(`optionImage-${index}`, file);
//       });

//       // Append matching type data if applicable
//       if (formData.questionType === 'matching') {
//         submitData.append('matchingPairs', JSON.stringify(formData.matchingPairs));
        
//         // Append matching images
//         Object.entries(matchingImageFiles).forEach(([key, file]) => {
//           submitData.append(`matchingImage-${key}`, file);
//         });
//       }

//       const url = isEditing && questionId !== 'new' 
//         ? `/api/questions/${questionId}`
//         : '/api/questions';

//       const method = isEditing && questionId !== 'new' ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         body: submitData,
//       });

//       const result = await response.json();

//       if (result.success) {
//         alert(`Question ${isEditing ? 'updated' : 'created'} successfully!`);
//         if (!isEditing) {
//           // Reset form after successful creation
//           setFormData({
//             questionText: "",
//             questionCode: "",
//             questionType: "radio",
//             difficulty: "medium",
//             marks: 1,
//             negativeMarks: 0,
//             subject: "",
//             topic: "",
//             tags: [],
//             options: [
//               { label: "A", text: "", image: "" },
//               { label: "B", text: "", image: "" },
//               { label: "C", text: "", image: "" },
//               { label: "D", text: "", image: "" },
//             ],
//             correctAnswers: [],
//             matchingPairs: {
//               leftItems: [
//                 { id: "L1", text: "", image: "", imageUrl: "" },
//                 { id: "L2", text: "", image: "", imageUrl: "" },
//               ],
//               rightItems: [
//                 { id: "R1", text: "", image: "", imageUrl: "" },
//                 { id: "R2", text: "", image: "", imageUrl: "" },
//               ],
//               correctMatches: {},
//             },
//             isSample: false,
//             explanation: "",
//             status: "draft",
//           });
//           setQuestionImageFile(null);
//           setOptionImageFiles({});
//           setMatchingImageFiles({});
//           setPreviewImages({});
//         }
//       } else {
//         alert(`Error: ${result.message}`);
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       alert('Failed to submit question. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
//           {isEditing ? "Edit" : "Add"} Question
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//               <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
//               Basic Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Question Code
//                 </label>
//                 <input
//                   type="text"
//                   name="questionCode"
//                   value={formData.questionCode}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="e.g., Q001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Question Type
//                 </label>
//                 <select
//                   name="questionType"
//                   value={formData.questionType}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="radio">Single Choice (MCQ)</option>
//                   <option value="checkbox">Multiple Choice</option>
//                   <option value="matching">Matching Type</option>
//                 </select>
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Question Text *
//               </label>
//               <textarea
//                 name="questionText"
//                 value={formData.questionText}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 rows="4"
//                 placeholder="Enter your question here..."
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Question Image (Optional)
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleQuestionImageChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//               {previewImages.question && (
//                 <div className="mt-3">
//                   <img
//                     src={previewImages.question}
//                     alt="Question preview"
//                     className="h-40 object-contain border-2 border-gray-300 rounded-lg"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           {formData.questionType === "matching" ? (
//             <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//                 <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
//                 Matching Items
//               </h2>
              
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-purple-300">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="font-semibold text-gray-700 text-lg">Column A (Questions)</h3>
//                     <button
//                       type="button"
//                       onClick={() => addMatchingItem("left")}
//                       className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
//                     >
//                       <Plus size={18} /> Add Item
//                     </button>
//                   </div>
                  
//                   {formData.matchingPairs.leftItems.map((item, index) => (
//                     <div key={item.id} className="mb-4 p-4 border-2 border-purple-200 rounded-lg bg-purple-50 hover:shadow-md transition-shadow">
//                       <div className="flex justify-between items-start mb-3">
//                         <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-full">{item.id}</span>
//                         {formData.matchingPairs.leftItems.length > 2 && (
//                           <button
//                             type="button"
//                             onClick={() => removeMatchingItem("left", index)}
//                             className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         )}
//                       </div>
                      
//                       <textarea
//                         value={item.text}
//                         onChange={(e) => handleMatchingItemChange("left", index, "text", e.target.value)}
//                         className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                         rows="2"
//                         placeholder="Enter question text..."
//                       />
                      
//                       <div className="space-y-2">
//                         <div className="flex gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setImageUploadMode(prev => ({
//                               ...prev,
//                               [`left-${index}`]: imageUploadMode[`left-${index}`] === 'file' ? '' : 'file'
//                             }))}
//                             className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                               imageUploadMode[`left-${index}`] === 'file' 
//                                 ? 'bg-blue-500 text-white shadow-md' 
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                             }`}
//                           >
//                             <Upload size={16} /> Upload File
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setImageUploadMode(prev => ({
//                               ...prev,
//                               [`left-${index}`]: imageUploadMode[`left-${index}`] === 'url' ? '' : 'url'
//                             }))}
//                             className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                               imageUploadMode[`left-${index}`] === 'url' 
//                                 ? 'bg-blue-500 text-white shadow-md' 
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                             }`}
//                           >
//                             <Link size={16} /> Image URL
//                           </button>
//                         </div>
                        
//                         {imageUploadMode[`left-${index}`] === 'file' && (
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={(e) => handleMatchingImageUpload("left", index, e)}
//                             className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
//                           />
//                         )}
                        
//                         {imageUploadMode[`left-${index}`] === 'url' && (
//                           <input
//                             type="url"
//                             value={item.imageUrl || ''}
//                             onChange={(e) => handleMatchingItemChange("left", index, "imageUrl", e.target.value)}
//                             className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                             placeholder="https://example.com/image.jpg"
//                           />
//                         )}
                        
//                         {(previewImages[`matching-left-${index}`] || item.imageUrl) && (
//                           <img
//                             src={previewImages[`matching-left-${index}`] || item.imageUrl}
//                             alt={`Left ${item.id}`}
//                             className="w-full h-32 object-contain border-2 border-purple-300 rounded-lg bg-white p-2"
//                           />
//                         )}
//                       </div>
                      
//                       <div className="mt-3">
//                         <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
//                           Correct Match:
//                         </label>
//                         <select
//                           value={formData.matchingPairs.correctMatches[item.id] || ""}
//                           onChange={(e) => handleCorrectMatchChange(item.id, e.target.value)}
//                           className="w-full p-2 border-2 border-purple-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                         >
//                           <option value="">Select matching answer</option>
//                           {formData.matchingPairs.rightItems.map((rightItem) => (
//                             <option key={rightItem.id} value={rightItem.id}>
//                               {rightItem.id} - {rightItem.text.substring(0, 30)}{rightItem.text.length > 30 ? '...' : ''}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-pink-300">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="font-semibold text-gray-700 text-lg">Column B (Answers)</h3>
//                     <button
//                       type="button"
//                       onClick={() => addMatchingItem("right")}
//                       className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
//                     >
//                       <Plus size={18} /> Add Item
//                     </button>
//                   </div>
                  
//                   {formData.matchingPairs.rightItems.map((item, index) => (
//                     <div key={item.id} className="mb-4 p-4 border-2 border-pink-200 rounded-lg bg-pink-50 hover:shadow-md transition-shadow">
//                       <div className="flex justify-between items-start mb-3">
//                         <span className="font-bold text-pink-700 bg-white px-3 py-1 rounded-full">{item.id}</span>
//                         {formData.matchingPairs.rightItems.length > 2 && (
//                           <button
//                             type="button"
//                             onClick={() => removeMatchingItem("right", index)}
//                             className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         )}
//                       </div>
                      
//                       <textarea
//                         value={item.text}
//                         onChange={(e) => handleMatchingItemChange("right", index, "text", e.target.value)}
//                         className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                         rows="2"
//                         placeholder="Enter answer text..."
//                       />
                      
//                       <div className="space-y-2">
//                         <div className="flex gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setImageUploadMode(prev => ({
//                               ...prev,
//                               [`right-${index}`]: imageUploadMode[`right-${index}`] === 'file' ? '' : 'file'
//                             }))}
//                             className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                               imageUploadMode[`right-${index}`] === 'file' 
//                                 ? 'bg-blue-500 text-white shadow-md' 
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                             }`}
//                           >
//                             <Upload size={16} /> Upload File
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setImageUploadMode(prev => ({
//                               ...prev,
//                               [`right-${index}`]: imageUploadMode[`right-${index}`] === 'url' ? '' : 'url'
//                             }))}
//                             className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                               imageUploadMode[`right-${index}`] === 'url' 
//                                 ? 'bg-blue-500 text-white shadow-md' 
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                             }`}
//                           >
//                             <Link size={16} /> Image URL
//                           </button>
//                         </div>
                        
//                         {imageUploadMode[`right-${index}`] === 'file' && (
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={(e) => handleMatchingImageUpload("right", index, e)}
//                             className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
//                           />
//                         )}
                        
//                         {imageUploadMode[`right-${index}`] === 'url' && (
//                           <input
//                             type="url"
//                             value={item.imageUrl || ''}
//                             onChange={(e) => handleMatchingItemChange("right", index, "imageUrl", e.target.value)}
//                             className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                             placeholder="https://example.com/image.jpg"
//                           />
//                         )}
                        
//                         {(previewImages[`matching-right-${index}`] || item.imageUrl) && (
//                           <img
//                             src={previewImages[`matching-right-${index}`] || item.imageUrl}
//                             alt={`Right ${item.id}`}
//                             className="w-full h-32 object-contain border-2 border-pink-300 rounded-lg bg-white p-2"
//                           />
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//                 <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
//                 Answer Options
//               </h2>

//               {formData.options.map((option, index) => (
//                 <div key={index} className="mb-4 p-4 border-2 border-green-200 rounded-lg bg-white hover:shadow-md transition-shadow">
//                   <div className="flex items-center mb-3">
//                     <span className="font-bold text-lg mr-4 bg-green-100 text-green-700 px-3 py-1 rounded-full">
//                       {option.label}
//                     </span>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type={formData.questionType === "radio" ? "radio" : "checkbox"}
//                         name="correctAnswers"
//                         checked={formData.correctAnswers.includes(option.label)}
//                         onChange={() => handleCorrectAnswerChange(option.label)}
//                         className="mr-2 w-5 h-5 text-green-500 focus:ring-green-500"
//                       />
//                       <span className="font-medium text-green-700">Mark as Correct Answer</span>
//                     </label>
//                   </div>

//                   <div className="mb-3">
//                     <textarea
//                       value={option.text}
//                       onChange={(e) => handleOptionChange(index, "text", e.target.value)}
//                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       rows="2"
//                       placeholder={`Enter option ${option.label} text...`}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Option Image (Optional)
//                     </label>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleOptionImageChange(index, e)}
//                       className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
//                     />
//                     {previewImages[`option-${index}`] && (
//                       <div className="mt-3">
//                         <img
//                           src={previewImages[`option-${index}`]}
//                           alt={`Option ${option.label} preview`}
//                           className="h-32 object-contain border-2 border-green-300 rounded-lg"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//               <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
//               Additional Details
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Difficulty Level
//                 </label>
//                 <select
//                   name="difficulty"
//                   value={formData.difficulty}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                 >
//                   <option value="easy">Easy</option>
//                   <option value="medium">Medium</option>
//                   <option value="hard">Hard</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Marks
//                 </label>
//                 <input
//                   type="number"
//                   name="marks"
//                   value={formData.marks}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   min="0"
//                   step="0.5"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Negative Marks
//                 </label>
//                 <input
//                   type="number"
//                   name="negativeMarks"
//                   value={formData.negativeMarks}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   min="0"
//                   step="0.5"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   placeholder="e.g., Mathematics"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Topic
//                 </label>
//                 <input
//                   type="text"
//                   name="topic"
//                   value={formData.topic}
//                   onChange={handleInputChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   placeholder="e.g., Algebra"
//                 />
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Tags (comma separated)
//               </label>
//               <input
//                 type="text"
//                 value={formData.tags.join(", ")}
//                 onChange={(e) => {
//                   const tagsArray = e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag);
//                   setFormData((prev) => ({ ...prev, tags: tagsArray }));
//                 }}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                 placeholder="e.g., algebra, geometry, math"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Explanation
//               </label>
//               <textarea
//                 name="explanation"
//                 value={formData.explanation}
//                 onChange={handleInputChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                 rows="3"
//                 placeholder="Provide explanation for the correct answer..."
//               />
//             </div>

//             <div className="flex items-center gap-4">
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="isSample"
//                   checked={formData.isSample}
//                   onChange={handleInputChange}
//                   className="mr-2 w-5 h-5 text-amber-500 focus:ring-amber-500"
//                 />
//                 <span className="font-medium text-gray-700">Mark as Sample Question</span>
//               </label>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Status
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleInputChange}
//                   className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                 >
//                   <option value="draft">Draft</option>
//                   <option value="publish">Publish</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end gap-4 pt-6 border-t">
//             <button
//               type="button"
//               onClick={() => window.history.back()}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   {isEditing ? "Updating..." : "Creating..."}
//                 </>
//               ) : (
//                 <>
//                   {isEditing ? "Update Question" : "Create Question"}
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default QuestionForm;