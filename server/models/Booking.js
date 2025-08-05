const mongoose = require("mongoose");
const moment = require("moment");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  cancelledAt: {
    type: Date,
  },
});

// Virtual for formatted booking date
bookingSchema.virtual("formattedBookingDate").get(function () {
  return moment(this.bookingDate).format("DD-MMM-YYYY");
});

// Virtual for formatted cancellation date
bookingSchema.virtual("formattedCancelledDate").get(function () {
  return this.cancelledAt
    ? moment(this.cancelledAt).format("DD-MMM-YYYY")
    : null;
});

// Ensure virtuals are included in JSON
bookingSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);
