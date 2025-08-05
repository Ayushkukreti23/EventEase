const express = require("express");
const { body, validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const { auth, adminAuth } = require("../middleware/auth");
const bookingLogger = require("../middleware/bookingLogger");
const moment = require("moment");

const router = express.Router();

// Apply booking logger middleware
router.use(bookingLogger);

// Create booking (authenticated users)
router.post(
  "/",
  auth,
  [
    body("eventId").notEmpty().withMessage("Event ID is required"),
    body("seats")
      .isInt({ min: 1, max: 2 })
      .withMessage("Seats must be between 1 and 2"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId, seats } = req.body;

      console.log("Booking request received:", {
        eventId,
        seats,
        userId: req.user?._id,
      });

      // Find event
      const event = await Event.findById(eventId);
      if (!event) {
        console.log("Event not found:", eventId);
        return res.status(404).json({ message: "Event not found" });
      }

      console.log("Event found:", {
        eventId: event._id,
        title: event.title,
        capacity: event.capacity,
      });

      // Check if event has passed
      const eventDate = moment(event.date);
      const today = moment();

      console.log("Date check:", {
        eventDate: eventDate.format("YYYY-MM-DD"),
        today: today.format("YYYY-MM-DD"),
        isPast: eventDate.isBefore(today, "day"),
      });

      if (eventDate.isBefore(today, "day")) {
        console.log("Event has passed");
        return res.status(400).json({ message: "Cannot book for past events" });
      }

      // Check if user already has a booking for this event
      const existingBooking = await Booking.findOne({
        user: req.user._id,
        event: eventId,
        status: "confirmed",
      });

      console.log("Existing booking check:", {
        userId: req.user._id,
        eventId,
        existingBooking: existingBooking ? "found" : "not found",
      });

      if (existingBooking) {
        console.log("User already has booking for this event");
        return res
          .status(400)
          .json({ message: "You already have a booking for this event" });
      }

      // Check capacity
      const totalBookedSeats = await Booking.aggregate([
        { $match: { event: eventId, status: "confirmed" } },
        { $group: { _id: null, totalSeats: { $sum: "$seats" } } },
      ]);

      const bookedSeats =
        totalBookedSeats.length > 0 ? totalBookedSeats[0].totalSeats : 0;
      const availableSeats = event.capacity - bookedSeats;

      console.log("Capacity check:", {
        totalBookedSeats: totalBookedSeats,
        bookedSeats,
        eventCapacity: event.capacity,
        availableSeats,
        requestedSeats: seats,
      });

      if (seats > availableSeats) {
        console.log("Capacity exceeded:", {
          requested: seats,
          available: availableSeats,
        });
        return res.status(400).json({
          message: `Only ${availableSeats} seats available for this event`,
        });
      }

      // Create booking
      const booking = new Booking({
        user: req.user._id,
        event: eventId,
        seats,
        totalAmount: event.price * seats,
      });

      await booking.save();

      // Populate event details
      await booking.populate("event");

      res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      console.error("Create booking error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        user: req.user?._id,
        eventId: req.body.eventId,
        seats: req.body.seats,
      });
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user bookings (authenticated users)
router.get("/my-bookings", auth, async (req, res) => {
  try {
    console.log("Get user bookings request:", {
      userId: req.user._id,
      userRole: req.user.role,
    });

    const bookings = await Booking.find({ user: req.user._id })
      .populate("event")
      .sort({ bookingDate: -1 });

    console.log("Found bookings:", bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel booking (authenticated users)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }

    // Check if event has started
    if (moment(booking.event.date).isSameOrBefore(moment(), "day")) {
      return res.status(400).json({
        message: "Cannot cancel booking for events that have started",
      });
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all bookings (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { eventId, status } = req.query;

    let filter = {};

    if (eventId) {
      filter.event = eventId;
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email")
      .populate("event", "title eventId date")
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get event attendees (admin only)
router.get("/event/:eventId/attendees", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      event: req.params.eventId,
      status: "confirmed",
    })
      .populate("user", "name email")
      .sort({ bookingDate: 1 });

    const attendees = bookings.map((booking) => ({
      user: booking.user,
      seats: booking.seats,
      bookingDate: booking.formattedBookingDate,
    }));

    res.json(attendees);
  } catch (error) {
    console.error("Get attendees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get event availability (public - for calculating available seats)
router.get("/event/:eventId/availability", async (req, res) => {
  try {
    const totalBookedSeats = await Booking.aggregate([
      {
        $match: {
          event: req.params.eventId,
          status: "confirmed",
        },
      },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: "$seats" },
        },
      },
    ]);

    const bookedSeats =
      totalBookedSeats.length > 0 ? totalBookedSeats[0].totalSeats : 0;

    res.json({ bookedSeats });
  } catch (error) {
    console.error("Get event availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get booking statistics (admin only)
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const stats = {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user booking statistics (authenticated users)
router.get("/user-stats", auth, async (req, res) => {
  try {
    console.log("Get user stats request:", {
      userId: req.user._id,
      userRole: req.user.role,
    });

    const userBookings = await Booking.find({ user: req.user._id });

    const totalBookings = userBookings.length;
    const confirmedBookings = userBookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;
    const cancelledBookings = userBookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;

    const totalSpent = userBookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((total, booking) => total + booking.totalAmount, 0);

    const stats = {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalSpent,
    };

    console.log("User stats calculated:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
