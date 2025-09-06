"use client";
// Import React and necessary hooks
import React, { useState, useEffect } from "react";
// Import Next.js router for navigation
import { useRouter, useParams } from "next/navigation";
// Import axios instance for API calls
import api from "@/lib/axios";

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
      { label: "D", text: "", image: "" }
    ],
    correctAnswers: [],
    isSample: false,
    explanation: "",
    status: "draft"
  });
  
  // State for image files
  const [questionImageFile, setQuestionImageFile] = useState(null);
  const [optionImageFiles, setOptionImageFiles] = useState({});
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for preview images
  const [previewImages, setPreviewImages] = useState({});
  // State for tracking if we're editing an existing question
  const [isEditing, setIsEditing] = useState(false);

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
                image: "" 
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
              status: data.data.status || "draft"
            });
            
            // Set preview images for existing images
            if (data.data.questionImage) {
              setPreviewImages(prev => ({
                ...prev,
                question: data.data.questionImage
              }));
            }
            
            // Set preview images for option images
            data.data.options?.forEach((option, index) => {
              if (option.image) {
                setPreviewImages(prev => ({
                  ...prev,
                  [`option-${index}`]: option.image
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
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Function to handle option changes
  const handleOptionChange = (index, field, value) => {
    // Create updated options array
    const updatedOptions = [...formData.options];
    // Update specific option field
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    // Update form data with new options
    setFormData(prev => ({
      ...prev,
      options: updatedOptions
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
        ? formData.correctAnswers.filter(a => a !== label)
        : [...formData.correctAnswers, label];
    }
    // Update form data with new correct answers
    setFormData(prev => ({
      ...prev,
      correctAnswers: updatedAnswers
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
      setPreviewImages(prev => ({
        ...prev,
        question: previewUrl
      }));
    }
  };

  // Function to handle image upload for options
  const handleOptionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Update option image files
      setOptionImageFiles(prev => ({
        ...prev,
        [index]: file
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      // Update preview images
      setPreviewImages(prev => ({
        ...prev,
        [`option-${index}`]: previewUrl
      }));
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();
    // Set loading state
    setLoading(true);
    
    try {
      // Create FormData object for file uploads
      const submitData = new FormData();
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === "options" || key === "correctAnswers" || key === "tags") {
          // Stringify arrays for form data
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          // Append other fields directly
          submitData.append(key, formData[key]);
        }
      });
      
      // Append exam ID to form data
      submitData.append("examId", examId);
      
      // Append question image if selected
      if (questionImageFile) {
        submitData.append("questionImage", questionImageFile);
      }
      
      // Append option images if selected
      Object.keys(optionImageFiles).forEach(index => {
        submitData.append(`optionImage-${index}`, optionImageFiles[index]);
      });
      
      // Determine API endpoint and method based on edit or add
      let response;
      if (isEditing) {
        // For editing existing question
        submitData.append("_id", questionId);
        response = await api.put(`/api/questions/${questionId}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      } else {
        // For adding new question
        response = await api.post("/api/questions", submitData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }
      
      // Check if API call was successful
      if (response.data.success) {
        // Navigate back to questions list
        router.push(`/dashboard/admin/exam/${examId}/questions`);
        router.refresh(); // Refresh the page to see updated data
      } else {
        // Show error message
        alert(response.data.message || "Operation failed");
      }
    } catch (err) {
      // Log error and show alert
      console.error("Operation failed", err);
      alert("Operation failed: " + (err.response?.data?.message || err.message));
    } finally {
      // Reset loading state
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Form header */}
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit" : "Add"} Question
      </h1>
      
      {/* Question form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          {/* Question code input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Code
            </label>
            <input
              type="text"
              name="questionCode"
              value={formData.questionCode}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter question code"
            />
          </div>
          
          {/* Question text input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <textarea
              name="questionText"
              value={formData.questionText}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows="4"
              placeholder="Enter question text"
              required
            />
          </div>
          
          {/* Question image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleQuestionImageChange}
              className="w-full p-2 border rounded-md"
            />
            {/* Display preview if available */}
            {(previewImages.question || formData.questionImage) && (
              <div className="mt-2">
                <img
                  src={previewImages.question || formData.questionImage}
                  alt="Question preview"
                  className="h-32 object-contain border rounded"
                />
              </div>
            )}
          </div>
          
          {/* Question type selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              name="questionType"
              value={formData.questionType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="radio">Single Choice</option>
              <option value="checkbox">Multiple Choice</option>
            </select>
          </div>
        </div>

        {/* Options section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          
          {/* Map through options */}
          {formData.options.map((option, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <div className="flex items-center mb-2">
                {/* Option label */}
                <span className="font-medium mr-3">Option {option.label}:</span>
                
                {/* Correct answer checkbox */}
                <label className="flex items-center">
                  <input
                    type={formData.questionType === "radio" ? "radio" : "checkbox"}
                    name="correctAnswers"
                    checked={formData.correctAnswers.includes(option.label)}
                    onChange={() => handleCorrectAnswerChange(option.label)}
                    className="mr-2"
                  />
                  Correct Answer
                </label>
              </div>
              
              {/* Option text input */}
              <div className="mb-3">
                <textarea
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder="Enter option text"
                  required
                />
              </div>
              
              {/* Option image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleOptionImageChange(index, e)}
                  className="w-full p-2 border rounded-md"
                />
                {/* Display preview if available */}
                {(previewImages[`option-${index}`] || option.image) && (
                  <div className="mt-2">
                    <img
                      src={previewImages[`option-${index}`] || option.image}
                      alt={`Option ${option.label} preview`}
                      className="h-32 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional information section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          
          {/* Difficulty selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {/* Marks input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          
          {/* Negative marks input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Negative Marks
              </label>
              <input
                type="number"
                name="negativeMarks"
                value={formData.negativeMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                min="0"
                step="0.5"
              />
            </div>
            
            {/* Sample question checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isSample"
                checked={formData.isSample}
                onChange={handleInputChange}
                className="mr-2"
                id="isSample"
              />
              <label htmlFor="isSample" className="text-sm font-medium text-gray-700">
                Sample Question
              </label>
            </div>
          </div>
          
          {/* Subject and topic inputs */}
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
                className="w-full p-2 border rounded-md"
                placeholder="Enter subject"
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
                className="w-full p-2 border rounded-md"
                placeholder="Enter topic"
              />
            </div>
          </div>
          
          {/* Tags input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(", ")}
              onChange={(e) => {
                const tagsArray = e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag);
                setFormData(prev => ({ ...prev, tags: tagsArray }));
              }}
              className="w-full p-2 border rounded-md"
              placeholder="Enter tags separated by commas"
            />
          </div>
          
          {/* Explanation textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="Enter explanation for the answer"
            />
          </div>
          
          {/* Status selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="publish">Publish</option>
            </select>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-4">
          {/* Cancel button */}
          <button
            type="button"
            onClick={() => router.push(`/dashboard/admin/exam/${examId}/questions`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Export component
export default QuestionForm;