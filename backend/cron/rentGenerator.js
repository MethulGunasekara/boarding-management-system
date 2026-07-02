const cron = require('node-cron');
const Tenant = require('../models/Tenant');
const ChargeLine = require('../models/ChargeLine');

// This standard cron string '0 1 * * *' means "Run at 1:00 AM every single day"
const startRentCronJob = () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ [CRON] Running daily rent generation check...');
    
    try {
      const today = new Date();
      const currentDay = today.getDate(); // e.g., if today is July 4th, this is 4

      // 1. Find all active tenants
      const activeTenants = await Tenant.find({ status: 'ACTIVE' });

      let generatedCount = 0;

      for (const tenant of activeTenants) {
        const admissionDay = new Date(tenant.admissionDate).getDate();

        // 2. If today's day matches their admission day, it's rent day!
        if (admissionDay === currentDay) {
          
          // Verify we haven't already billed them for this specific month to prevent double-billing bugs
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const existingRentCharge = await ChargeLine.findOne({
            tenant: tenant._id,
            type: 'RENT',
            dueDate: { $gte: startOfMonth }
          });

          if (!existingRentCharge) {
            // Generate the bill
            await ChargeLine.create({
              tenant: tenant._id,
              type: 'RENT',
              amountDue: tenant.monthlyRent, // NOTE: Make sure this field exists in your DB!
              dueDate: today,
              status: 'PENDING'
            });
            generatedCount++;
          }
        }
      }
      
      console.log(`✅ [CRON] Completed. Generated ${generatedCount} rent charges.`);
    } catch (error) {
      console.error('❌ [CRON] Failed to generate rent:', error);
    }
  });
};

module.exports = startRentCronJob;