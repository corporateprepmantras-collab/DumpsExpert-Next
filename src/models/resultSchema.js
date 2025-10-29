// models/resultSchema.js - FINAL UPDATED VERSION
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: String, // ✅ Changed to String to support temp students
      required: true,
      index: true,
    },
    examId: {
      type: String, // ✅ Changed to String to support temp exams
      required: true,
    },
    examCode: { 
      type: String, 
      required: true,
      index: true 
    },
    totalQuestions: { 
      type: Number, 
      required: true 
    },
    attempted: { 
      type: Number, 
      required: true 
    },
    correct: { 
      type: Number, 
      required: true 
    },
    wrong: { 
      type: Number, 
      required: true 
    },
    percentage: { 
      type: Number, 
      required: true 
    },
    duration: { 
      type: Number, 
      required: true 
    }, // in seconds
    
    // ✅ UPDATED: Detailed question information
    questions: [
      {
        questionId: { type: String },
        questionText: { type: String },
        questionImage: { type: String },
        questionType: {
          type: String,
          enum: ["mcq", "checkbox", "matching", "true-false", "radio"]
        },
        
        // For MCQ/Checkbox questions
        options: [
          {
            label: String,
            text: String,
            image: String,
            _id: false // Disable auto _id for subdocuments
          }
        ],
        
        // For Matching questions
        matchingPairs: {
          leftItems: [
            {
              id: String,
              text: String,
              image: String,
              _id: false
            }
          ],
          rightItems: [
            {
              id: String,
              text: String,
              image: String,
              _id: false
            }
          ],
          correctMatches: mongoose.Schema.Types.Mixed
        },
        
        // Answer fields
        correctAnswer: mongoose.Schema.Types.Mixed, // String, Array, or Object
        selectedAnswer: mongoose.Schema.Types.Mixed, // User's answer
        isCorrect: { type: Boolean, default: false },
        
        // Additional fields
        marks: { type: Number, default: 1 },
        explanation: { type: String }
      }
    ],
    
    // ✅ Keep userAnswers for backward compatibility
    userAnswers: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {} 
    },
    
    // ✅ Attempt tracking
    attempt: { 
      type: Number, 
      required: true,
      default: 1 
    },
    
    // ✅ Temp student flag
    isTempStudent: { 
      type: Boolean, 
      default: false 
    },
    
    completedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true
  }
);

// ✅ Compound index for faster queries
resultSchema.index({ studentId: 1, examCode: 1, attempt: -1 });

// ✅ Index for temp student cleanup (optional)
resultSchema.index({ isTempStudent: 1, createdAt: 1 });

// ✅ Prevent OverwriteModelError in Next.js
const Result = mongoose.models.Result || mongoose.model("Result", resultSchema);

export default Result;