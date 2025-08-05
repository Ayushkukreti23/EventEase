const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: "./config.env" });

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Option 1: Create a new admin user
    const adminData = {
      name: "Admin User",
      email: "admin@eventease.com",
      password: "admin123456", // Change this to a secure password
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      // Update existing user to admin role
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log("✅ Existing user updated to admin role:", adminData.email);
    } else {
      // Create new admin user
      const adminUser = new User(adminData);
      await adminUser.save();
      console.log("✅ New admin user created:", adminData.email);
    }

    console.log("Admin credentials:");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("Role: admin");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createAdminUser();
