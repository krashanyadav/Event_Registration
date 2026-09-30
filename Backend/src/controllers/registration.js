const Registration = require('../models/registration.js');
const Event = require('../models/event.js');

// POST /api/registrations/:eventId  (logged-in user)
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Capacity check (0 = unlimited)
    if (event.capacity > 0) {
      const confirmedCount = await Registration.countDocuments({
        event: eventId,
        status: 'confirmed',
      });
      if (confirmedCount >= event.capacity) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    // Pehle se cancelled registration hai to usko reactivate karo
    let registration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
    });

    if (registration) {
      if (registration.status === 'confirmed') {
        return res.status(400).json({ message: 'Already registered for this event' });
      }
      registration.status = 'confirmed';
      await registration.save();
    } else {
      registration = await Registration.create({
        user: req.user._id,
        event: eventId,
        status: 'confirmed',
      });
    }

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/registrations/my  (logged-in user ki apni registrations)
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/registrations/:id/cancel  (apni hi registration cancel kar sakte ho)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own registration' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled', registration });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/registrations/event/:eventId  (organizer: apne event ke registrants)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only view registrations for your own events' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email');

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventRegistrations,
};