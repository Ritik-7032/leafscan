import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  vegetable: {
    type: String,
    required: true,
    trim: true,
  },
  disease: {
    type: String,
    required: true,
    trim: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  isHealthy: {
    type: Boolean,
    required: true,
    default: false,
  },
  thumbnail: {
    type: String,
    maxlength: 40000, // Safe limit for 128px compressed thumbnail (~20KB)
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const Scan = mongoose.model('Scan', scanSchema);
