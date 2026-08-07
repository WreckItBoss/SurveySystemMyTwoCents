import "dotenv/config";

import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 5050;

console.log("server.js loaded");

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

    await connectDatabase();

    console.log("MongoDB connection finished");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);

    process.exit(1);
  }
}

startServer();