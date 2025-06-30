// connection.js
import mongoose from "mongoose";
import { DB_NAME } from "../../shared/constants/app.constants.js";

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(
			`${process.env.MONGODB_URI}/${DB_NAME}`,
			{
				// useNewUrlParser: true,
				// useUnifiedTopology: true,
			},
		);
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
		// console.log(connectionInstance.connection);
	} catch (error) {
		console.error(`❌ MongoDB Connection Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
