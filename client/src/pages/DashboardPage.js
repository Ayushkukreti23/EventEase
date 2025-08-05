import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Calendar, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLogin, setRecentLogin] = useState(false);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      // Check if user just logged in (by checking if we came from login page)
      const fromLogin = sessionStorage.getItem("fromLogin");
      if (fromLogin) {
        setRecentLogin(true);
        sessionStorage.removeItem("fromLogin");
        // Clear the flag after a short delay
        setTimeout(() => setRecentLogin(false), 2000);
      }
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log("Fetching dashboard data...");
      console.log("User authenticated:", !!user);
      console.log(
        "Auth token present:",
        !!axios.defaults.headers.common["Authorization"]
      );

      const [bookingsResponse, statsResponse] = await Promise.all([
        axios.get("/api/bookings/my-bookings"),
        axios.get("/api/bookings/user-stats"),
      ]);

      console.log("Bookings response:", bookingsResponse.data);
      console.log("Stats response:", statsResponse.data);

      setBookings(bookingsResponse.data.slice(0, 5)); // Get latest 5 bookings

      // Calculate user-specific stats
      const userBookings = bookingsResponse.data;
      const upcomingBookings = userBookings.filter(
        (booking) =>
          booking.event &&
          booking.event.status === "Upcoming" &&
          booking.status === "confirmed"
      ).length;

      setStats({
        totalBookings: statsResponse.data.totalBookings,
        upcomingBookings,
        totalSpent: statsResponse.data.totalSpent,
      });

      // Clear any existing error toasts if data loads successfully
      toast.dismiss();
    } catch (error) {
      console.error("Error fetching user data:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Only show login error if user is not authenticated
      if (error.response?.status === 401 && !user) {
        toast.error("Please login to view dashboard");
      } else if (error.response?.status === 403) {
        toast.error("Access denied");
      } else if (error.response?.status === 401 && user) {
        // User is authenticated but token might be invalid
        // Don't show session expired if we just logged in successfully
        if (!recentLogin) {
          console.log("Session expired detected, but user is authenticated");
        }
      } else {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
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

  // Show loading spinner while user authentication is being determined
  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Upcoming Events
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">Browse Events</span>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/my-bookings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Users className="h-5 w-5 text-primary-600 mr-3" />
            <span className="font-medium text-gray-900">View All Bookings</span>
            <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Bookings
          </h2>
          <Link
            to="/my-bookings"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring events and make your first booking!
            </p>
            <Link
              to="/events"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {booking.event?.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {booking.event?.formattedDate} at {booking.event?.time}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {booking.seats} seat{booking.seats > 1 ? "s" : ""}
                      </span>
                      <span>${booking.totalAmount.toFixed(2)}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/events/${booking.event?._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
