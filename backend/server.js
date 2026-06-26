require('dotenv').config(); // Must be at the very top to load env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import our route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const boardingPlaceRoutes = require('./routes/boardingPlaceRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const costRoutes = require('./routes/costRoutes');
const tenantPortalRoutes = require('./routes/tenantPortalRoutes');

// Import Error Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 2. Global Middleware
app.use(express.json()); // Intercepts requests and parses JSON bodies
app.use(cors()); // Cross-Origin Resource Sharing: allows our Vite frontend to talk to this API

// 3. Mount Routes
app.use('/auth', authRoutes); // Any request starting with '/auth' will be handed off to the authRoutes file
app.use('/admin', adminRoutes); 
app.use('/boarding-places', boardingPlaceRoutes);
app.use('/tenants', tenantRoutes);
app.use('/costs', costRoutes);
app.use('/portal', tenantPortalRoutes);
app.use('/upload', require('./routes/uploadRoutes'));


// If the request made it past all the routes above without a match, it hits notFound
app.use(notFound);
// If ANY route throws an error, it gets sent down here to the errorHandler
app.use(errorHandler);

// 4. Database Connection & Server Initialization
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    
    // Only start listening for requests AFTER the database connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Stop the server if the database fails to connect
  });