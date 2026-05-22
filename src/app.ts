import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/database.js';
import { authRouter } from './modules/auth/auth.router.js';
import { issuesRouter } from './modules/issues/issues.router.js';
import { errorHandler } from './middleware/error.middleware.js';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Base Middlewares
app.use(cors());
app.use(express.json());

// Application Routing Modules
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);

// Undefined Routes fallback catch
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Requested route endpoint destination does not exist'
  });
});

// Global centralized Error Manager tracking pipeline handles sync & async catches
app.use(errorHandler);

// Bootstrapping operations sequence
const bootstrap = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 DevPulse server fully alive and spinning on port ${PORT}`);
  });
};

bootstrap();