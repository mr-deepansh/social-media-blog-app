import dotenv from "dotenv";
import os from "os";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

const getLocalIP = () => {
	return (
		Object.values(os.networkInterfaces())
			.flat()
			.find(({ family, internal }) => family === "IPv4" && !internal)
			?.address || "localhost"
	);
};

const startServer = async () => {
	try {
		await connectDB();
		const PORT = process.env.PORT || 8080;
		const LOCAL_IP = getLocalIP();

		app.listen(PORT, "0.0.0.0", () => {
			console.log(`⚙️  Server is running at:`);
			console.log(`🔹 Local:   http://localhost:${PORT}`);
			console.log(`🔹 Network: http://${LOCAL_IP}:${PORT}`);
			// console.log(`⚙️  Server is running at:`);
			// console.log(`🔹 Local:   http://localhost:${PORT}/api/v1`);
			// console.log(`🔹 Network: http://${LOCAL_IP}:${PORT}/api/v1`);
		});
	} catch (err) {
		console.error("❌ MONGO DB connection failed:", err);
		process.exit(1);
	}
};

startServer();
