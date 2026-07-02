require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const boardingPlaceRoutes = require('./routes/boardingPlaceRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const costRoutes = require('./routes/costRoutes');
const tenantPortalRoutes = require('./routes/tenantPortalRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const depositRoutes = require('./routes/depositRoutes');

// Error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/boarding-places', boardingPlaceRoutes);
app.use('/tenants', tenantRoutes);
app.use('/costs', costRoutes);
app.use('/portal', tenantPortalRoutes);
app.use('/upload', require('./routes/uploadRoutes'));
app.use('/payments', paymentRoutes);
app.use('/deposits', depositRoutes);

// Error Handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Database Connection & Server Initialization
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });