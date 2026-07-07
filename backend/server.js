require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes              = require('./routes/authRoutes');
const adminRoutes             = require('./routes/adminRoutes');
const boardingPlaceRoutes     = require('./routes/boardingPlaceRoutes');
const tenantRoutes            = require('./routes/tenantRoutes');
const costRoutes              = require('./routes/costRoutes');
const tenantPortalRoutes      = require('./routes/tenantPortalRoutes');
const uploadRoutes            = require('./routes/uploadRoutes');
const depositRoutes           = require('./routes/depositRoutes');
const paymentRoutes           = require('./routes/paymentRoutes');
const planRoutes              = require('./routes/planRoutes');
const ownerSubscriptionRoutes = require('./routes/ownerSubscriptionRoutes');
const rentRecordRoutes        = require('./routes/rentRecordRoutes');
const notificationRoutes      = require('./routes/notificationRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(express.json());

// ── CORS ───────────────────────────────────────────────────────────────────
// Allow both local development and all Vercel deployment URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Vercel production
  'https://boarding-management-system.vercel.app',
  // Vercel preview deployments (auto-generated URLs)
  /\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );

    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use('/auth',            authRoutes);
app.use('/admin',           adminRoutes);
app.use('/admin',           ownerSubscriptionRoutes);
app.use('/boarding-places', boardingPlaceRoutes);
app.use('/tenants',         tenantRoutes);
app.use('/costs',           costRoutes);
app.use('/portal',          tenantPortalRoutes);
app.use('/upload',          uploadRoutes);
app.use('/deposits',        depositRoutes);
app.use('/payments',        paymentRoutes);
app.use('/plans',           planRoutes);
app.use('/rent-records',    rentRecordRoutes);
app.use('/notifications',   notificationRoutes);

app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });