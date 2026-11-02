
const express = require('express');
const router = express.Router();

const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// ==========================================
// SLA AUTOMATIC ESCALATION
// ==========================================
const updateEscalations = async () => {
  await Complaint.updateMany(
    {
      resolutionDeadline: { $lt: new Date() },
      status: { $nin: ['Resolved', 'Rejected'] },
      isEscalated: false
    },
    {
      $set: { isEscalated: true }
    }
  );
};

// All routes below require admin access
router.use(authMiddleware, adminMiddleware);

// ==========================================
// GET: View all complaints
// ==========================================
router.get('/complaints', async (req, res) => {
  try {
    // Automatically escalate overdue complaints
    await updateEscalations();

    const complaints = await Complaint.find()
      .populate('citizen', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Complaints retrieved successfully.',
      complaints
    });
  } catch (error) {
    console.error('Admin complaints error:', error);

    res.status(500).json({
      message: 'Unable to retrieve complaints.'
    });
  }
});

// ==========================================
// GET: Admin dashboard statistics
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    // Automatically escalate overdue complaints
    await updateEscalations();

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({
      status: 'Pending'
    });
    const inProgress = await Complaint.countDocuments({
      status: 'In Progress'
    });
    const resolved = await Complaint.countDocuments({
      status: 'Resolved'
    });
    const rejected = await Complaint.countDocuments({
      status: 'Rejected'
    });
    const escalated = await Complaint.countDocuments({
      isEscalated: true
    });

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      escalated
    });
  } catch (error) {
    console.error('Admin stats error:', error);

    res.status(500).json({
      message: 'Unable to retrieve dashboard statistics.'
    });
  }
});

// ==========================================
// PATCH: Update complaint status and assignment
// ==========================================
router.patch('/complaints/:id', async (req, res) => {
  try {
    const {
      status,
      department,
      resolutionDeadline
    } = req.body;

    const allowedStatuses = [
      'Pending',
      'In Progress',
      'Resolved',
      'Rejected'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid complaint status.'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    const oldStatus = complaint.status;
    const oldDepartment = complaint.department;

    // Update status
    if (status !== undefined) {
      complaint.status = status;
    }

    // Update department
    if (department !== undefined) {
      complaint.department = department;
    }

    // Update resolution deadline
    if (resolutionDeadline !== undefined) {
      complaint.resolutionDeadline =
        resolutionDeadline || null;
    }

    // Clear escalation when complaint is resolved/rejected
    if (
      complaint.status === 'Resolved' ||
      complaint.status === 'Rejected'
    ) {
      complaint.isEscalated = false;
    }

    await complaint.save();

    // ==========================================
    // CREATE CITIZEN NOTIFICATIONS
    // ==========================================
    const notifications = [];

    // Status notification
    if (status !== undefined && status !== oldStatus) {
      notifications.push({
        citizen: complaint.citizen,
        complaint: complaint._id,
        message: `Your complaint "${complaint.title}" status changed from ${oldStatus} to ${status}.`,
        type: 'Status Update'
      });
    }

    // Department assignment notification
    if (
      department !== undefined &&
      department !== oldDepartment &&
      department !== 'Not Assigned'
    ) {
      notifications.push({
        citizen: complaint.citizen,
        complaint: complaint._id,
        message: `Your complaint "${complaint.title}" has been assigned to ${department}.`,
        type: 'Department Assignment'
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      message: 'Complaint updated successfully.',
      complaint
    });
  } catch (error) {
    console.error('Admin complaint update error:', error);

    res.status(500).json({
      message: 'Unable to update complaint.'
    });
  }
});

module.exports = router;
