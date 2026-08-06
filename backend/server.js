import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/mongodb.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Sync the admin account with .env on every startup.
    //
    // The old version only checked `User.findOne({ email: ADMIN_EMAIL })`.
    // That meant: if you fixed a typo in ADMIN_EMAIL or changed
    // ADMIN_PASSWORD in .env, the old lookup found no match (different
    // email) and silently created a SECOND admin account — leaving the
    // old, wrong-email account (with the old password) still active and
    // still able to log in, while the new email/password combo pointed at
    // a brand-new account that only exists if the server actually
    // restarted with the new .env values loaded.
    //
    // Fix: look up the admin by ROLE (there's only ever meant to be one),
    // not by email. If found, keep that same account and just sync its
    // email/password to whatever is currently in .env. If not found,
    // create it. Either way there is exactly one admin account, and its
    // credentials always match .env — no orphaned duplicates.
    const envEmail = (process.env.ADMIN_EMAIL || 'admin@portfolio.com').toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: envEmail,
        password: envPassword,
        role: 'admin',
        status: 'active',
      });
      console.log(`✓ Default admin user created (${envEmail})`);
    } else {
      const emailChanged = existingAdmin.email !== envEmail;
      // NOTE: this always resets the password to match .env on every
      // restart. That's intentional here so ADMIN_EMAIL/ADMIN_PASSWORD in
      // .env stay the reliable "reset switch" if you ever get locked out.
      // If you'd rather your in-app Settings -> Change Password change
      // survive server restarts, remove ADMIN_PASSWORD from .env after
      // your first login (envPassword then only fills in on a fresh
      // account, never overwrites an existing one — see the `if
      // (process.env.ADMIN_PASSWORD)` guard below).
      existingAdmin.email = envEmail;
      if (process.env.ADMIN_PASSWORD) {
        existingAdmin.password = envPassword; // pre('save') hook re-hashes this
      }
      await existingAdmin.save();
      console.log(
        emailChanged
          ? `✓ Admin email synced from .env (${existingAdmin.email})`
          : `✓ Admin account synced with .env (${existingAdmin.email})`
      );
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║      🚀 Portfolio Backend Server Running              ║
║      Listening on http://localhost:${PORT}           
║      Environment: ${process.env.NODE_ENV || 'development'}
║      Database: ${process.env.MONGODB_URI?.substring(0, 30)}...
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('✗ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled Rejection:', err);
  process.exit(1);
});