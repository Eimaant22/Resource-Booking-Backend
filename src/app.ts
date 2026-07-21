import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

import errorHandler from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

const app = express();

// Trust the reverse proxy (Render) to correctly parse client IPs for rate limiting
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);



// Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Server is running.',
        },
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;