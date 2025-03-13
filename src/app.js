import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
// 🌐 CORS Configuration
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		credentials: true,
	}),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Health Check Route
app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		message: "API is Running Successfully",
		timestamp: new Date().toISOString(),
	});
});

// Import Routes
import userRoutes from "./routes/user.routes.js";
import blogRoutes from "./routes/blogs.routes.js";

// route declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

// ❌ 404 Not Found Handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route Not Found",
	});
});

export { app };
