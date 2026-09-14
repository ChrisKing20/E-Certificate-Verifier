"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./config/db");
const Admin_1 = require("./models/Admin");
const mongoose_1 = __importDefault(require("mongoose"));
async function seedDatabase() {
    console.log('🌱 Connecting to MongoDB to seed Administrator account...');
    await (0, db_1.connectDB)();
    const adminEmail = 'admin@ecertificate.local';
    const plainPassword = 'Admin@123';
    const passwordHash = await bcrypt_1.default.hash(plainPassword, 10);
    const existing = await Admin_1.Admin.findOne({ email: adminEmail });
    if (existing) {
        existing.passwordHash = passwordHash;
        await existing.save();
        console.log(`✅ Administrator account updated: ${existing.email}`);
    }
    else {
        const newAdmin = await Admin_1.Admin.create({
            name: 'College Certificate Administrator',
            email: adminEmail,
            passwordHash,
            role: 'ADMIN',
        });
        console.log(`✅ Institutional Administrator created: ${newAdmin.email}`);
    }
    console.log('🎉 MongoDB seeding complete. 0 mock certificates created.');
    await mongoose_1.default.disconnect();
}
seedDatabase().catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
});
