import http from "http";
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import "./config/database/connection.js";

// Get local LAN IP (e.g. 192.168.x.x)
const getLocalIp = () => {
	const nets = os.networkInterfaces();
	for (const name in nets) {
		for (const net of nets[name]) {
			if (net.family === "IPv4" && !net.internal) {
				return net.address;
			}
		}
	}
	return "localhost";
};

const startServer = () => {
	const server = http.createServer(app);
	server.listen(serverConfig.port, "0.0.0.0", () => {
		const localIP = getLocalIp();
		console.log(
			"✅ MongoDB Connected: ac-plgpi9r-shard-00-00.ggw6kgo.mongodb.net",
		);

		console.log("⚙️  Server is running at:");
		console.log(`🔹 Local:   http://localhost:${serverConfig.port}`);
		console.log(`🔹 Network: http://${localIP}:${serverConfig.port}`);
		console.log(
			`🔹 Local:   http://localhost:${serverConfig.port}/api/${serverConfig.apiVersion}`,
		);
		console.log(
			`🔹 Network: http://${localIP}:${serverConfig.port}/api/${serverConfig.apiVersion}`,
		);
	});

	server.on("error", (err) => {
		if (err.code === "EADDRINUSE") {
			console.error(`❌ Port ${serverConfig.port} is already in use.`);
		} else {
			console.error("❌ Failed to start server:", err);
		}
		process.exit(1);
	});

	// Handle server errors
	server.on("error", (err) => {
		if (err.code === "EADDRINUSE") {
			console.error(`❌ Port ${serverConfig.port} is already in use.`);
		} else {
			console.error("❌ Failed to start server:", err);
		}
		process.exit(1);
	});
};
startServer();
