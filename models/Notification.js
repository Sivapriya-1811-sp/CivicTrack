
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['Status Update', 'Department Assignment'],
      default: 'Status Update'
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
