import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Database Connected successfully!!");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server running on port ${envVars.PORT}`);
    });
  } catch (error: any) {
    console.log("MongoDB connection Error Occured!!", error);
  }
};

(async () => {
  await startServer();
})();

// Error handling for server gracefully shutdown

const shutdown = async (signal: string) => {
  console.log(`${signal} recieved! Server shutting down gracefully....`);

  if (server) {
    server.close(() => {
      console.log("Process terminated!");
      // সফলভাবে বন্ধ হলে exit(0), আর এরর এর কারণে হলে exit(1)
      process.exit(
        signal === "uncaughtException" || signal === "unhandledRejection"
          ? 1
          : 0,
      );
    });
  } else {
    process.exit(0);
  }
};


// সিগন্যাল হ্যান্ডলিং
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// এক্সেপশন হ্যান্ডলিং
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});
 