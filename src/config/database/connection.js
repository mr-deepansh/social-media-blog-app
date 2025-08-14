// connection.js
import mongoose from "mongoose";
import { DB_NAME } from "../../shared/constants/app.constants.js";

const connectDB = async () => {
	try {
		// Production-grade mongoose settings
		mongoose.set('strictQuery', false);
		mongoose.set('debug', false);
		mongoose.set('bufferCommands', false);
		
		if (!process.env.MONGODB_URI) {
			throw new Error('MONGODB_URI environment variable is required');
		}
		
		const conn = await mongoose.connect(
			`${process.env.MONGODB_URI}/${DB_NAME}`,
			{
				// Enterprise connection settings
				maxPoolSize: 10,
				minPoolSize: 2,
				maxIdleTimeMS: 30000,
				serverSelectionTimeoutMS: 15000,
				socketTimeoutMS: 45000,
				connectTimeoutMS: 15000,
				heartbeatFrequencyMS: 10000,
				retryWrites: true,
				w: 'majority',
			}
		);
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`❌ MongoDB Connection Error: ${error.message}`);
		console.log('⚠️ Please check your MongoDB Atlas connection and IP whitelist');
		process.exit(1);
	}
};

export default connectDB;