import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	}),
);

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.static('Public'));
app.use(cookieParser());

// import Routes
import userRoutes from './routes/user.routes.js';
import blogRoutes from './routes/blogs.routes.js';

// routes declaration
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/blogs', blogRoutes);

export { app };
