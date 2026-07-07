const cron      = require('node-cron');
const Tenant    = require('../models/Tenant');
const RentRecord  = require('../models/RentRecord');
const ChargeLine  = require('../models/ChargeLine');
const Payment     = require('../models/Payment');
const Deposit     = require('../models/Deposit');
const NotificationLog = require('../models/NotificationLog');
const { deleteImages } = require('../utils/cloudinary');

/**
 * Daily at 06:00 — two jobs:
 * 1. Generate pending RentRecords for active tenants.
 * 2. Hard-delete MOVED_OUT tenants older than 30 days (+ Cloudinary assets).
 */
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Daily cron running:', new Date().toISOString());

  // ── Job 1: Generate rent records ──────────────────────────────────────
  try {
    const activeTenants = await Tenant.find({ status: 'ACTIVE' });

    for (const tenant of activeTenants) {
      try {
        const admissionDate = new Date(tenant.admissionDate);
        const today         = new Date();

        // Rolling 30-day cycle: find next due date
        const dueDate = new Date(admissionDate);
        while (dueDate <= today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const monthKey  = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        const monthName = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const existing = await RentRecord.findOne({ tenant: tenant._id, monthKey });
        if (!existing) {
          await RentRecord.create({
            tenant:    tenant._id,
            monthName, monthKey,
            amountDue: tenant.rentAmount,
            dueDate,
            status:    'PENDING',
          });
        }

        // Mark overdue records
        await RentRecord.updateMany(
          { tenant: tenant._id, status: 'PENDING', dueDate: { $lt: today } },
          { status: 'OVERDUE' }
        );
      } catch (err) {
        console.error(`Cron rent-gen error for tenant ${tenant._id}:`, err.message);
      }
    }

    console.log(`✅ Rent records processed for ${activeTenants.length} tenants.`);
  } catch (err) {
    console.error('❌ Rent generation cron failed:', err.message);
  }

  // ── Job 2: Delete moved-out tenants after 30 days ─────────────────────
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const toDelete = await Tenant.find({
      status:       'MOVED_OUT',
      movedOutDate: { $lt: thirtyDaysAgo },
    });

    for (const tenant of toDelete) {
      try {
        // 1. Delete Cloudinary assets first
        await deleteImages([
          tenant.idFrontImageUrl,
          tenant.idBackImageUrl,
          tenant.signatureImageUrl,
        ]);

        // 2. Cascade delete DB records
        await ChargeLine.deleteMany({ tenant: tenant._id });
        await Payment.deleteMany({ tenant: tenant._id });
        await Deposit.deleteMany({ tenant: tenant._id });
        await RentRecord.deleteMany({ tenant: tenant._id });
        await NotificationLog.deleteMany({ relatedId: tenant._id });
        await Tenant.findByIdAndDelete(tenant._id);

        console.log(`🗑️  Deleted moved-out tenant: ${tenant.fullName} (${tenant._id})`);
      } catch (err) {
        console.error(`Failed to delete tenant ${tenant._id}:`, err.message);
      }
    }

    if (toDelete.length > 0) {
      console.log(`✅ Deleted ${toDelete.length} moved-out tenant(s) and their Cloudinary assets.`);
    }
  } catch (err) {
    console.error('❌ Tenant cleanup cron failed:', err.message);
  }
});