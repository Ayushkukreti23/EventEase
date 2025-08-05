import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const EventDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [seats, setSeats] = useState(1);
  const [availableSeats, setAvailableSeats] = useState(0);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);

      // Calculate available seats using public endpoint
      const availabilityResponse = await axios.get(
        `/api/bookings/event/${id}/availability`
      );
      const bookedSeats = availabilityResponse.data.bookedSeats;
      setAvailableSeats(response.data.capacity - bookedSeats);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book this event");
      navigate("/login");
      return;
    }

    if (seats > availableSeats) {
      toast.error(`Only ${availableSeats} seats available`);
      return;
    }

    setBookingLoading(true);
    try {
      console.log("Booking request:", {
        eventId: id,
        seats: seats,
        user: isAuthenticated ? "authenticated" : "not authenticated",
      });

      await axios.post("/api/bookings", {
        eventId: id,
        seats: seats,
      });

      toast.success("Booking successful!");
      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data?.errors) {
        // Handle validation errors
        error.response.data.errors.forEach((err) => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else if (error.response?.data?.message) {
        // Handle specific error messages
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error("Please login to book this event");
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast.error("Event not found");
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-green-100 text-green-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Event not found
        </h3>
        <p className="text-gray-600">
          The event you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Event Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status}
              </span>
              <span className="ml-3 text-sm text-gray-500">
                {event.eventId}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                ${event.price}
              </div>
              <div className="text-sm text-gray-500">per seat</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <p className="text-gray-600 text-lg mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span>{event.formattedDate}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-3" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span>
                {event.location} ({event.locationType})
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3" />
              <span>{availableSeats} seats available</span>
            </div>
          </div>
        </div>

        {/* Booking Section - Only for Regular Users */}
        {user?.role !== "admin" && (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book Your Seats
            </h2>

            {event.status === "Completed" ? (
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-gray-600">
                  This event has already taken place.
                </p>
              </div>
            ) : availableSeats === 0 ? (
              <div className="bg-red-100 p-4 rounded-md">
                <p className="text-red-600">This event is fully booked.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats (Max 2)
                  </label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[...Array(Math.min(2, availableSeats))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-xl font-semibold text-primary-600">
                      ${(event.price * seats).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !isAuthenticated}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading
                    ? "Processing..."
                    : isAuthenticated
                    ? "Book Now"
                    : "Login to Book"}
                </button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 text-center">
                    You need to be logged in to book this event
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Section - Only for Admins */}
        {user?.role === "admin" && (
          <div className="p-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Admin Actions
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">
                  Event Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Total Capacity:</span>
                    <span className="ml-2 font-medium">{event.capacity}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Available Seats:</span>
                    <span className="ml-2 font-medium">{availableSeats}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Booked Seats:</span>
                    <span className="ml-2 font-medium">
                      {event.capacity - availableSeats}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Booking Rate:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(
                        ((event.capacity - availableSeats) / event.capacity) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/admin`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Manage Event
                </button>
                <button
                  onClick={() => navigate(`/admin`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Attendees
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
