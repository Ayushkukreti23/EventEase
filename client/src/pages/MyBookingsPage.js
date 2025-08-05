import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, MapPin, Clock, Users, X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings/my-bookings");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`, {
        status: "cancelled",
      });
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Ongoing":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelBooking = (booking) => {
    return (
      booking.status === "confirmed" &&
      booking.event &&
      booking.event.status === "Upcoming"
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your event bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600">You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.event?.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    {booking.event && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(
                          booking.event.status
                        )}`}
                      >
                        {booking.event.status}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">
                    {booking.event?.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {booking.event?.formattedDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {booking.event?.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {booking.event?.location} ({booking.event?.locationType})
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-primary-600">
                      ${booking.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Booked on {booking.formattedBookingDate}
                    </div>
                  </div>

                  {booking.status === "cancelled" &&
                    booking.formattedCancelledDate && (
                      <div className="mt-2 text-sm text-red-600">
                        Cancelled on {booking.formattedCancelledDate}
                      </div>
                    )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {cancellingId === booking._id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                )}

                {booking.status === "confirmed" && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Confirmed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
