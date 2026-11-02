
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        'Road Damage',
        'Water Leakage',
        'Waste Disposal',
        'Street Light',
        'Drainage Problem',
        'Other'
      ]
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Resolved',
        'Rejected'
      ],
      default: 'Pending'
    },

    department: {
      type: String,
      default: 'Not Assigned'
    },

    resolutionDeadline: {
      type: Date,
      default: null
    },

    comment: {
      type: String,
      default: ''
    },

    // SLA Escalation
    isEscalated: {
      type: Boolean,
      default: false
    },

    // Citizen Feedback
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      comment: {
        type: String,
        default: ''
      }
    },

    // Community Upvotes
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);
