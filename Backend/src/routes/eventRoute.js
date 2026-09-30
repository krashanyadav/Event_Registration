const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventContoller.js');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/', protect, organizerOnly, createEvent);
router.put('/:id', protect, organizerOnly, updateEvent);
router.delete('/:id', protect, organizerOnly, deleteEvent);

module.exports = router;     