const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema(
  {
    phase: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    actor: { type: String, default: 'System Dispatch' }
  },
  { _id: false }
);

const IssueSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Illegal Dumping',
        'Overflowing Bin',
        'Hazardous Chemical Waste',
        'Biohazard / Medical Waste',
        'Construction Debris',
        'Plastic Accumulation',
        'Blocked Drainage',
        'Electronic E-Waste'
      ]
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'In-Progress', 'Resolved'],
      default: 'Pending',
      index: true
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true }
    },
    photoUrl: {
      type: String,
      default: ''
    },
    assignedWorker: {
      type: String,
      default: ''
    },
    reporterName: {
      type: String,
      default: 'Anonymous Citizen',
      trim: true
    },
    reporterPhone: {
      type: String,
      default: '',
      trim: true
    },
    timeline: {
      type: [TimelineSchema],
      default: []
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

IssueSchema.index({ status: 1, severity: 1 });
IssueSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
