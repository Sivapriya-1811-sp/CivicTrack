
const express = require('express');
const router = express.Router();

const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/auth');

// Submit a new complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      image
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Please provide all required complaint details.'
      });
    }

    const complaint = new Complaint({
      citizen: req.user.id,
      title,
      description,
      category,
      location,
      image: image || ''
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully!',
      complaint
    });
  } catch (error) {
    console.error('Complaint submission error:', error);

    res.status(500).json({
      message: 'Unable to submit complaint.'
    });
  }
});

// Get public complaints for community voting
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $ne: 'Rejected' }
    })
      .select('title description category location image status upvotes createdAt')
      .sort({ createdAt: -1 });

    const publicComplaints = complaints.map(complaint => ({
      ...complaint.toObject(),
      upvotes: complaint.upvotes.length,
      hasUpvoted: complaint.upvotes.some(
        id => id.toString() === req.user.id
      )
    }));

    res.status(200).json({
      complaints: publicComplaints
    });
  } catch (error) {
    console.error('Public complaints error:', error);

    res.status(500).json({
      message: 'Unable to fetch public complaints.'
    });
  }
});

// Get complaints submitted by the logged-in citizen
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      citizen: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      complaints
    });
  } catch (error) {
    console.error('Fetching complaints error:', error);

    res.status(500).json({
      message: 'Unable to fetch complaints.'
    });
  }
});

// Get one complaint belonging to the logged-in citizen
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      citizen: req.user.id
    });

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    res.status(200).json({
      complaint
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch complaint.'
    });
  }
});

// Submit feedback for a resolved complaint
router.patch('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Please provide a rating between 1 and 5.'
      });
    }

    // Find complaint belonging to the logged-in citizen
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      citizen: req.user.id
    });

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    // Feedback is allowed only for resolved complaints
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        message: 'Feedback can only be submitted for resolved complaints.'
      });
    }

    // Prevent duplicate feedback
    if (complaint.feedback && complaint.feedback.rating !== null) {
      return res.status(400).json({
        message: 'Feedback has already been submitted for this complaint.'
      });
    }

    // Save feedback
    complaint.feedback = {
      rating,
      comment: typeof comment === 'string' ? comment.trim() : ''
    };

    await complaint.save();

    res.status(200).json({
      message: 'Thank you! Your feedback has been submitted.',
      feedback: complaint.feedback
    });

  } catch (error) {
    console.error('Feedback submission error:', error);

    res.status(500).json({
      message: 'Unable to submit feedback.'
    });
  }
});

// Community Upvotes: Add or remove support
router.patch('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    const userId = req.user.id;

    const alreadyUpvoted = complaint.upvotes.some(
      id => id.toString() === userId
    );

    if (alreadyUpvoted) {
      complaint.upvotes = complaint.upvotes.filter(
        id => id.toString() !== userId
      );
    } else {
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.status(200).json({
      message: alreadyUpvoted
        ? 'Support removed successfully.'
        : 'Complaint supported successfully.',
      upvotes: complaint.upvotes.length,
      hasUpvoted: !alreadyUpvoted
    });

  } catch (error) {
    console.error('Upvote error:', error);

    res.status(500).json({
      message: 'Unable to update complaint support.'
    });
  }
});

module.exports = router;
