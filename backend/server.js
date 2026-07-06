require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes               = require('./routes/authRoutes');
const adminRoutes              = require('./routes/adminRoutes');
const boardingPlaceRoutes      = require('./routes/boardingPlaceRoutes');
const tenantRoutes             = require('./routes/tenantRoutes');
const costRoutes               = require('./routes/costRoutes');
const tenantPortalRoutes       = require('./routes/tenantPortalRoutes');
const uploadRoutes             = require('./routes/uploadRoutes');
const depositRoutes            = require('./routes/depositRoutes');
const paymentRoutes            = require('./routes/paymentRoutes');
const planRoutes               = require('./routes/planRoutes');
const ownerSubscriptionRoutes  = require('./routes/ownerSubscriptionRoutes');
const rentRecordRoutes         = require('./routes/rentRecordRoutes');
const notificationRoutes       = require('./routes/notificationRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth',            authRoutes);
app.use('/admin',           adminRoutes);
app.use('/admin',           ownerSubscriptionRoutes);  // /admin/owners, /admin/owner-subscriptions
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
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });