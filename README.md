# EventEase - Event Booking Platform

A full-stack event booking platform where users can explore and book events such as concerts, webinars, or workshops. Admins can create and manage events, while users can book tickets and view their bookings.

## 🚀 Features

### Public Users

- View marketing landing page
- Browse available events
- Filter events by category, location, date range, and status
- Register or log in

### Logged-in Users

- Book up to 2 seats per event
- View bookings in list view
- Cancel bookings (only if event hasn't started)
- See booking status and confirmation details

### Admin Users

- Access admin panel
- Create, update, or delete events
- Set event capacity
- View full list of attendees for each event
- Monitor event statuses (Upcoming, Ongoing, Completed)

## 🛠️ Tech Stack

- **Frontend**: React with Context API for state management
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT-based login/register
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd event_easee
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_easee
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

#### Frontend Configuration

The frontend is configured to proxy requests to `http://localhost:5000` (backend).

### 4. Database Setup

Make sure MongoDB is running on your system or update the `MONGODB_URI` in the config file to point to your MongoDB instance.

### 6. Start the application

#### Development Mode (Both frontend and backend)

```bash
npm run dev
```

#### Start Backend Only

```bash
npm run server
```

#### Start Frontend Only

```bash
npm run client
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
event_easee/
├── server/                 # Backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config.env         # Environment variables
│   └── index.js           # Server entry point
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── index.js       # App entry point
│   ├── public/            # Static files
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 Core Features Implementation

### Booking Logic

- Users can book up to 2 seats per event
- Prevents booking if event is at full capacity
- Auto-generates custom event IDs using format: `EVT-[MMM][YYYY]-[Random3]` (e.g., EVT-AUG2025-X4T)

### Event Status

- Dynamically determines status based on event date:
  - **Upcoming**: Event is in the future
  - **Ongoing**: Event is today
  - **Completed**: Event has passed

### Authentication & Authorization

- JWT-based user login and registration
- Role-based access control for admin and users
- Protected routes for authenticated users

### Custom Middleware

- Booking logger middleware that logs each new booking with user and timestamp info

### Date Formatting

- Consistent DD-MMM-YYYY format across the application (e.g., 30-Jul-2025)

### Event Filtering

- **Category Filter**: Filter by Music, Tech, Business, Education, Sports, Arts, Other
- **Location Type Filter**: Filter by Online or In-Person events
- **Date Range Filter**: Filter events by start and end dates
- **Status Filter**: Filter by Upcoming, Ongoing, or Completed events
- **Search Filter**: Search events by title, description, or location
- **Real-time Results**: Shows count of filtered events

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events

- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `GET /api/events/categories/list` - Get event categories

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/event/:eventId/attendees` - Get event attendees (admin only)
- `GET /api/bookings/stats` - Get booking statistics (admin only)

## 👥 User Roles

### Regular User

- Can browse events
- Can book up to 2 seats per event
- Can view and cancel their own bookings
- Cannot access admin features

### Admin User

- All regular user permissions
- Can create, edit, and delete events
- Can view all bookings and attendees
- Can access admin dashboard with statistics

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Modern, clean interface with Tailwind CSS
- Loading states and error handling
- Toast notifications for user feedback
- Form validation and error messages
- Status indicators for events and bookings

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Protected API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**EventEase** - Making event booking simple and efficient! 🎉
