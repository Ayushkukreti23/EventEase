const mongoose = require("mongoose");
const Booking = require("../models/Booking");
require("dotenv").config({ path: "./config.env" });

const clearBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Booking.deleteMany({});
    console.log("✅ Cleared all existing bookings");

    console.log("All bookings have been cleared. Users can now book events!");
  } catch (error) {
    console.error("Error clearing bookings:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

clearBookings();
