import mongoose, { Schema, model } from 'mongoose';
import { ISubmission, ProcessingStatus, GradeType, ProjectType } from '../types';

const submissionScoreSchema = new Schema({
  total: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  testScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  qualityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  breakdown: [{
    category: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    feedback: {
      type: String,
      required: true
    }
  }]
}, { _id: false });

const testResultSchema = new Schema({
  passed: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  details: {
    type: String,
    required: true,
    default: '-'
  },
  duration: {
    type: Number
  }
}, { _id: false });

const aiAnalysisSchema = new Schema({
  promptTokens: {
    type: Number,
    required: true,
    default: 0
  },
  completionTokens: {
    type: Number,
    required: true,
    default: 0
  },
  analysisTime: {
    type: Number,
    required: true,
    default: 0
  },
  modelUsed: {
    type: String,
    required: true,
    default: 'mock'
  }
}, { _id: false });

const submissionMetadataSchema = new Schema({
  projectType: {
    type: String,
    enum: ['express', 'react', 'fullstack', 'c'] as ProjectType[],
    required: true
  },
  dependencies: [{
    type: String
  }],
  testResults: {
    type: testResultSchema,
    required: true,
    default: () => ({})
  },
  aiAnalysis: {
    type: aiAnalysisSchema,
    required: true,
    default: () => ({})
  },
  repositorySize: {
    type: Number
  },
  fileCount: {
    type: Number
  }
}, { _id: false });

const submissionSchema = new Schema<ISubmission>({
  githubUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https:\/\/github\.com\/[\w\.-]+\/[\w\.-]+(?:\.git)?$/.test(v);
      },
      message: 'Must be a valid GitHub repository URL'
    }
  },
  userId: {
    type: String,
    required: true,
    trim: true
  },
  instructorId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['uploading', 'installing', 'testing', 'reviewing', 'reporting', 'completed', 'failed'] as ProcessingStatus[],
    default: 'uploading'
  },
  grade: {
    type: String,
    enum: ['pass', 'fail', 'pending'] as GradeType[],
    default: 'pending'
  },
  scores: {
    type: submissionScoreSchema
  },
  report: {
    type: String
  },
  instructorFeedback: {
    type: String
  },
  instructorReport: {
    type: String
  },
  rubric: {
    type: Schema.Types.Mixed
  },
  processingTime: {
    type: Number,
    min: 0
  },
  error: {
    type: String
  },
  metadata: {
    type: submissionMetadataSchema,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ instructorId: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ grade: 1 });
submissionSchema.index({ githubUrl: 1 });

submissionSchema.pre('save', function(next) {
  if (!this.metadata) {
    this.metadata = {
      projectType: 'express' as ProjectType,
      dependencies: [],
      testResults: {
        passed: 0,
        total: 0,
        details: ''
      },
      aiAnalysis: {
        promptTokens: 0,
        completionTokens: 0,
        analysisTime: 0,
        modelUsed: 'meta-llama/llama-4-maverick-17b-128e-instruct'
      }
    };
  }
  next();
});

submissionSchema.methods.calculateScore = function(): number {
  if (!this.scores) return 0;
  return this.scores.total;
};

submissionSchema.methods.isCompleted = function(): boolean {
  return this.status === 'completed';
};

submissionSchema.methods.isFailed = function(): boolean {
  return this.status === 'failed';
};

submissionSchema.methods.isProcessing = function(): boolean {
  return !['completed', 'failed'].includes(this.status);
};

submissionSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

submissionSchema.statics.findByInstructorId = function(instructorId: string) {
  return this.find({ instructorId }).sort({ createdAt: -1 });
};

submissionSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['uploading', 'installing', 'testing', 'reviewing', 'reporting'] } });
};

submissionSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        completedSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        averageScore: { $avg: '$scores.total' },
        averageProcessingTime: { $avg: '$processingTime' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSubmissions: 0,
    completedSubmissions: 0,
    failedSubmissions: 0,
    averageScore: 0,
    averageProcessingTime: 0
  };
};

export const Submission = model<ISubmission>('Submission', submissionSchema); 