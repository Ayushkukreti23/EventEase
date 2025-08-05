const moment = require("moment");

const bookingLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log booking activities
    if (req.path.includes("/bookings") && req.method === "POST") {
      const logData = {
        timestamp: moment().format("DD-MMM-YYYY HH:mm:ss"),
        user: req.user ? `${req.user.name} (${req.user.email})` : "Anonymous",
        action: "New Booking",
        eventId: req.body.eventId || "N/A",
        seats: req.body.seats || "N/A",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      };

      console.log("📝 BOOKING LOG:", JSON.stringify(logData, null, 2));
    }

    // Log booking cancellations
    if (
      req.path.includes("/bookings") &&
      req.method === "PUT" &&
      req.body.status === "cancelled"
    ) {
      const logData = {
        timestamp: moment().format("DD-MMM-YYYY HH:mm:ss"),
        user: req.user ? `${req.user.name} (${req.user.email})` : "Anonymous",
        action: "Booking Cancelled",
        bookingId: req.params.id || "N/A",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      };

      console.log("❌ CANCELLATION LOG:", JSON.stringify(logData, null, 2));
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = bookingLogger;
