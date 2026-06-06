import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import connectDB from './server/config/db.js';
import dotenv from 'dotenv';
import { seedUsers } from './server/utils/seeder.js';
import authRoutes from './server/routes/authRoutes.js';
import vendorRoutes from './server/routes/vendorRoutes.js';
import quotationRoutes from './server/routes/quotationRoutes.js';
import poRoutes from './server/routes/poRoutes.js';
import invoiceRoutes from './server/routes/invoiceRoutes.js';
import paymentRoutes from './server/routes/paymentRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';
import pdfRoutes from './server/routes/pdfRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import productRoutes from './server/routes/productRoutes.js';


dotenv.config();

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  // Seed default users (Admin, Manager, User)
  await seedUsers();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for Vite dev server
  }));
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/pos', poRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/pdf', pdfRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);


  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Procurement API is running' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();