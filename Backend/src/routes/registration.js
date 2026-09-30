const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
} = require('../controllers/registration.js');
const { protect, organizerOnly } = require('../middleware/authMiddleware.js');

router.post('/:eventId', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.put('/:id/cancel', protect, cancelRegistration);
router.get('/event/:eventId', protect, organizerOnly, getEventRegistrations);

module.exports = router;