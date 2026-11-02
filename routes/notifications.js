
const express = require('express');
const router = express.Router();

const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// All notification routes require login
router.use(authMiddleware);

// GET: Retrieve citizen notifications
router.get('/my', async (req, res) => {
  try {
    const notifications = await Notification.find({
      citizen: req.user.id
    })
      .populate('complaint', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications
    });
  } catch (error) {
    console.error('Notification retrieval error:', error);

    res.status(500).json({
      message: 'Unable to retrieve notifications.'
    });
  }
});

// PATCH: Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      citizen: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found.'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    console.error('Notification update error:', error);

    res.status(500).json({
      message: 'Unable to update notification.'
    });
  }
});

module.exports = router;
