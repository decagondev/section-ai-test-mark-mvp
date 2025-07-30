import mongoose, { Schema, model } from 'mongoose';
import { IUser, UserRole } from '../types';
import bcrypt from 'bcrypt';

const userProfileSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  institution: {
    type: String,
    trim: true,
    maxlength: 200
  },
  course: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, { _id: false });

const userPreferencesSchema = new Schema({
  emailNotifications: {
    type: Boolean,
    default: true
  },
  defaultRubric: {
    type: Schema.Types.ObjectId,
    ref: 'Rubric'
  }
}, { _id: false });

const userStatsSchema = new Schema({
  totalSubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const MarkerUserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Must be a valid email address'
    },
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'] as UserRole[],
    default: 'student'
  },
  profile: {
    type: userProfileSchema,
    required: true
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  stats: {
    type: userStatsSchema,
    default: () => ({})
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

MarkerUserSchema.index({ email: 1 });
MarkerUserSchema.index({ role: 1 });
MarkerUserSchema.index({ 'stats.lastActive': -1 });
MarkerUserSchema.index({ emailVerificationToken: 1 });
MarkerUserSchema.index({ passwordResetToken: 1 });

MarkerUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

MarkerUserSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('stats.lastActive')) {
    this.stats.lastActive = new Date();
  }
  
  if (!this.profile) {
    this.profile = {
      name: this.email.split('@')[0], // Default name from email
      institution: '',
      course: ''
    };
  }
  
  next();
});

MarkerUserSchema.methods.updateStats = async function() {
  const Submission = mongoose.model('Submission');
  
  const submissionStats = await Submission.aggregate([
    { $match: { userId: this._id.toString() } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: '$scores.total' }
      }
    }
  ]);
  
  if (submissionStats.length > 0) {
    this.stats.totalSubmissions = submissionStats[0].totalSubmissions || 0;
    this.stats.averageScore = submissionStats[0].averageScore || 0;
  }
  
  this.stats.lastActive = new Date();
  await this.save();
};

MarkerUserSchema.methods.isInstructor = function(): boolean {
  return this.role === 'instructor' || this.role === 'admin';
};

MarkerUserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

MarkerUserSchema.methods.canGradeSubmissions = function(): boolean {
  return this.role === 'instructor' || this.role === 'admin';
};

MarkerUserSchema.methods.getDisplayName = function(): string {
  return this.profile.name || this.email.split('@')[0];
};

MarkerUserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

MarkerUserSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

MarkerUserSchema.statics.findInstructors = function() {
  return this.find({ role: { $in: ['instructor', 'admin'] } });
};

MarkerUserSchema.statics.findStudents = function() {
  return this.find({ role: 'student' });
};

MarkerUserSchema.statics.getActiveUsers = function(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    'stats.lastActive': { $gte: cutoffDate }
  }).sort({ 'stats.lastActive': -1 });
};

MarkerUserSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        averageSubmissions: { $avg: '$stats.totalSubmissions' },
        averageScore: { $avg: '$stats.averageScore' }
      }
    }
  ]);
  
  const result = {
    total: 0,
    students: 0,
    instructors: 0,
    admins: 0,
    averageSubmissions: 0,
    averageScore: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'student') result.students = stat.count;
    if (stat._id === 'instructor') result.instructors = stat.count;
    if (stat._id === 'admin') result.admins = stat.count;
    result.averageSubmissions += stat.averageSubmissions || 0;
    result.averageScore += stat.averageScore || 0;
  });
  
  // Average across all roles
  if (stats.length > 0) {
    result.averageSubmissions = result.averageSubmissions / stats.length;
    result.averageScore = result.averageScore / stats.length;
  }
  
  return result;
};

MarkerUserSchema.statics.createUser = async function(userData: {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}) {
  const crypto = require('crypto');
  
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = new this({
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    role: userData.role || 'student',
    profile: {
      name: userData.name || userData.email.split('@')[0],
      institution: '',
      course: ''
    },
    isEmailVerified: false,
    emailVerificationToken
  });
  
  await user.save();
  return user;
};

MarkerUserSchema.statics.verifyPassword = async function(email: string, password: string) {
  const user = await this.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
};

export const MarkerUser = model<IUser>('MarkerUser', MarkerUserSchema); 