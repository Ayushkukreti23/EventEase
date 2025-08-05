const mongoose = require("mongoose");
const moment = require("moment");

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: false, // Will be auto-generated
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Music", "Tech", "Business", "Education", "Sports", "Arts", "Other"],
  },
  location: {
    type: String,
    required: true,
  },
  locationType: {
    type: String,
    required: true,
    enum: ["Online", "In-Person"],
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate custom event ID before saving
eventSchema.pre("save", function (next) {
  // Always generate eventId if it doesn't exist
  if (!this.eventId) {
    const month = moment(this.date).format("MMM").toUpperCase();
    const year = moment(this.date).format("YYYY");
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.eventId = `EVT-${month}${year}-${random}`;
  }
  next();
});

// Virtual for status calculation
eventSchema.virtual("status").get(function () {
  const now = moment();
  const eventDate = moment(this.date);

  if (eventDate.isBefore(now, "day")) {
    return "Completed";
  } else if (eventDate.isSame(now, "day")) {
    return "Ongoing";
  } else {
    return "Upcoming";
  }
});

// Virtual for formatted date
eventSchema.virtual("formattedDate").get(function () {
  return moment(this.date).format("DD-MMM-YYYY");
});

// Ensure virtuals are included in JSON
eventSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
