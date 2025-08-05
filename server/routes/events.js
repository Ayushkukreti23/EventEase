const express = require("express");
const { body, validationResult } = require("express-validator");
const Event = require("../models/Event");
const { auth, adminAuth } = require("../middleware/auth");
const moment = require("moment");

const router = express.Router();

// Get all events (public)
router.get("/", async (req, res) => {
  try {
    const { category, locationType, startDate, endDate, status, search } =
      req.query;

    let filter = {};

    // Filter by search term
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by location type
    if (locationType) {
      filter.locationType = locationType;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = moment(startDate, "YYYY-MM-DD")
          .startOf("day")
          .toDate();
      }
      if (endDate) {
        filter.date.$lte = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();
      }
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name")
      .sort({ date: 1 });

    // Filter by status if requested
    let filteredEvents = events;
    if (status) {
      filteredEvents = events.filter((event) => event.status === status);
    }

    res.json(filteredEvents);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single event (public)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create event (admin only)
router.post(
  "/",
  adminAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("category")
      .isIn([
        "Music",
        "Tech",
        "Business",
        "Education",
        "Sports",
        "Arts",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("locationType")
      .isIn(["Online", "In-Person"])
      .withMessage("Invalid location type"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time").trim().notEmpty().withMessage("Time is required"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const eventData = {
        ...req.body,
        createdBy: req.user._id,
      };

      const event = new Event(eventData);
      await event.save();

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update event (admin only)
router.put(
  "/:id",
  adminAuth,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("category")
      .optional()
      .isIn([
        "Music",
        "Tech",
        "Business",
        "Education",
        "Sports",
        "Arts",
        "Other",
      ])
      .withMessage("Invalid category"),
    body("location")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Location is required"),
    body("locationType")
      .optional()
      .isIn(["Online", "In-Person"])
      .withMessage("Invalid location type"),
    body("date").optional().isISO8601().withMessage("Valid date is required"),
    body("time").optional().trim().notEmpty().withMessage("Time is required"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Update event
      Object.assign(event, req.body);
      await event.save();

      res.json({
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete event (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get event categories (public)
router.get("/categories/list", async (req, res) => {
  try {
    const categories = [
      "Music",
      "Tech",
      "Business",
      "Education",
      "Sports",
      "Arts",
      "Other",
    ];
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
