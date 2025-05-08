import express from 'express';
import './db/mongoose.js';
import hunterRoutes from './routes/hunter.routes.js';
import merchantRoutes from './routes/merchant.routes.js';
import goodRoutes from './routes/good.routes.js';
import defaultRoutes from './routes/default.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

export const app = express();
app.use(express.json());
app.use(hunterRoutes);
app.use(merchantRoutes);
app.use(goodRoutes);
app.use(transactionRoutes);
app.use(defaultRoutes);