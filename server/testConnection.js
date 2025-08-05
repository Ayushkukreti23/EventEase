const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const testConnection = async () => {
  console.log("Testing MongoDB connection...");
  console.log("Connection string:", process.env.MONGODB_URI);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB!");

    // Test creating a simple document
    const testCollection = mongoose.connection.collection("test");
    await testCollection.insertOne({
      test: "connection",
      timestamp: new Date(),
    });
    console.log("✅ Successfully wrote to database!");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    // Try alternative connection strings
    const alternatives = [
      "mongodb://127.0.0.1:27017/event_easee",
      "mongodb://localhost:27017/event_easee",
      "mongodb://0.0.0.0:27017/event_easee",
    ];

    for (const alt of alternatives) {
      try {
        console.log(`\nTrying alternative: ${alt}`);
        await mongoose.connect(alt);
        console.log("✅ Alternative connection successful!");
        await mongoose.disconnect();
        console.log("Use this connection string:", alt);
        break;
      } catch (altError) {
        console.log("❌ Alternative failed:", altError.message);
      }
    }
  }
};

testConnection();
