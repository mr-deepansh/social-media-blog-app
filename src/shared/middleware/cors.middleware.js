// src/shared/middleware/cors.middleware.js
import cors from "cors";

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["*"];

    // Development mode - allow all origins
    if (
      process.env.NODE_ENV === "development" ||
			allowedOrigins.includes("*")
    ) {
      return callback(null, true);
    }

    // Production mode - check specific origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

export { corsOptions };
export default cors(corsOptions);
