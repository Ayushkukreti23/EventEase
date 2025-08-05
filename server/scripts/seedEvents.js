const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
require("dotenv").config({ path: "./config.env" });

const sampleEvents = [
  {
    title: "Tech Conference 2025",
    description:
      "Join us for the biggest tech conference of the year featuring AI, blockchain, and cloud computing experts.",
    category: "Tech",
    location: "San Francisco Convention Center",
    locationType: "In-Person",
    date: new Date("2025-01-15"),
    time: "09:00",
    capacity: 1000,
    price: 299,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
  },
  {
    title: "Jazz Night Live",
    description:
      "An evening of smooth jazz with live performances from top artists in the industry.",
    category: "Music",
    location: "Blue Note Jazz Club",
    locationType: "In-Person",
    date: new Date("2025-01-20"),
    time: "20:00",
    capacity: 500,
    price: 75,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
  },
  {
    title: "Digital Marketing Workshop",
    description:
      "Learn the latest digital marketing strategies from industry experts. Perfect for entrepreneurs and marketers.",
    category: "Business",
    location: "Online",
    locationType: "Online",
    date: new Date("2025-01-25"),
    time: "14:00",
    capacity: 2000,
    price: 49,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
  },
  {
    title: "Yoga Retreat Weekend",
    description:
      "A peaceful weekend retreat focused on yoga, meditation, and wellness in the mountains.",
    category: "Sports",
    location: "Mountain View Resort",
    locationType: "In-Person",
    date: new Date("2025-02-01"),
    time: "08:00",
    capacity: 200,
    price: 299,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  },
  {
    title: "Art Exhibition Opening",
    description:
      "Opening night of contemporary art exhibition featuring local and international artists.",
    category: "Arts",
    location: "Modern Art Gallery",
    locationType: "In-Person",
    date: new Date("2025-02-05"),
    time: "18:00",
    capacity: 300,
    price: 25,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500",
  },
  {
    title: "Web Development Bootcamp",
    description:
      "Intensive 4-week bootcamp covering HTML, CSS, JavaScript, and React. Perfect for beginners.",
    category: "Education",
    location: "Online",
    locationType: "Online",
    date: new Date("2025-02-10"),
    time: "10:00",
    capacity: 500,
    price: 199,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
  },
  {
    title: "Rock Concert",
    description:
      "Epic rock concert featuring multiple bands and amazing stage effects.",
    category: "Music",
    location: "Stadium Arena",
    locationType: "In-Person",
    date: new Date("2025-02-15"),
    time: "19:00",
    capacity: 15000,
    price: 89,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
  },
  {
    title: "Startup Networking Event",
    description:
      "Connect with fellow entrepreneurs, investors, and industry leaders in this exclusive networking event.",
    category: "Business",
    location: "Innovation Hub",
    locationType: "In-Person",
    date: new Date("2025-02-20"),
    time: "17:00",
    capacity: 800,
    price: 99,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
  },
  {
    title: "Cooking Masterclass",
    description:
      "Learn to cook like a professional chef with hands-on instruction and delicious recipes.",
    category: "Education",
    location: "Culinary Institute",
    locationType: "In-Person",
    date: new Date("2025-02-25"),
    time: "15:00",
    capacity: 100,
    price: 150,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
  },
  {
    title: "Marathon 2025",
    description:
      "Annual city marathon with scenic routes and professional timing. All skill levels welcome.",
    category: "Sports",
    location: "City Center",
    locationType: "In-Person",
    date: new Date("2025-03-01"),
    time: "07:00",
    capacity: 5000,
    price: 75,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  },
];

const seedEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find or create an admin user
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("No admin user found. Creating one...");
      adminUser = new User({
        name: "Admin User",
        email: "admin@eventease.com",
        password: "admin123456",
        role: "admin",
      });
      await adminUser.save();
      console.log("Admin user created:", adminUser.email);
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log("Cleared existing events");

    // Create sample events one by one to ensure eventId generation
    console.log("Creating sample events...");
    for (let i = 0; i < sampleEvents.length; i++) {
      const eventData = {
        ...sampleEvents[i],
        createdBy: adminUser._id,
      };
      const event = new Event(eventData);
      await event.save();
      console.log(
        `✅ Created event ${i + 1}: ${event.title} (${event.eventId})`
      );
    }
    console.log(`✅ Created ${sampleEvents.length} sample events`);

    console.log("\nSample events created:");
    sampleEvents.forEach((event, index) => {
      console.log(
        `${index + 1}. ${event.title} - ${event.category} - ${
          event.locationType
        }`
      );
    });
  } catch (error) {
    console.error("Error seeding events:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedEvents();
