"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const Admin_1 = require("../models/Admin");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecertificate';
function askQuestion(rl, query, isPassword = false) {
    return new Promise((resolve) => {
        if (isPassword && process.stdin.isTTY) {
            // Hide password input in TTY
            process.stdout.write(query);
            let password = '';
            const onData = (char) => {
                const str = char.toString('utf-8');
                switch (str) {
                    case '\n':
                    case '\r':
                    case '\u0004':
                        process.stdin.removeListener('data', onData);
                        if (process.stdin.setRawMode)
                            process.stdin.setRawMode(false);
                        process.stdout.write('\n');
                        resolve(password);
                        break;
                    case '\u0003': // Ctrl+C
                        process.exit(1);
                        break;
                    case '\u007f': // Backspace
                    case '\b':
                        if (password.length > 0) {
                            password = password.slice(0, -1);
                        }
                        break;
                    default:
                        password += str;
                        break;
                }
            };
            if (process.stdin.setRawMode)
                process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', onData);
        }
        else {
            rl.question(query, (answer) => {
                resolve(answer.trim());
            });
        }
    });
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    return null;
}
async function createAdmin() {
    console.log('\n==================================================');
    console.log('🔒 E-CERTIFICATE VERIFIER - ADMIN PROVISIONING');
    console.log('==================================================\n');
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✓ Successfully connected to MongoDB.\n');
        let name = process.env.ADMIN_NAME;
        let email = process.env.ADMIN_EMAIL;
        let password = process.env.ADMIN_PASSWORD;
        const isNonInteractive = name && email && password;
        if (!isNonInteractive) {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            console.log('Please enter the administrator details below:');
            name = await askQuestion(rl, 'Full Name: ');
            while (!name) {
                console.log('❌ Name cannot be empty.');
                name = await askQuestion(rl, 'Full Name: ');
            }
            email = await askQuestion(rl, 'Email Address: ');
            while (!email || !validateEmail(email)) {
                console.log('❌ Invalid email address format.');
                email = await askQuestion(rl, 'Email Address: ');
            }
            let passwordError = 'Initial';
            while (passwordError) {
                password = await askQuestion(rl, 'Password (min 8 chars): ', true);
                passwordError = validatePassword(password);
                if (passwordError) {
                    console.log(`❌ ${passwordError}`);
                }
            }
            rl.close();
        }
        else {
            console.log('Running non-interactive provisioning from environment variables...');
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Check if email already exists
        const existingAdmin = await Admin_1.Admin.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            console.log(`\n❌ Error: Admin user with email "${normalizedEmail}" already exists.`);
            await mongoose_1.default.disconnect();
            process.exit(1);
        }
        // Hash password with bcrypt
        console.log('\nHashing administrator password with bcrypt...');
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        // Create Admin document
        const newAdmin = new Admin_1.Admin({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
        });
        await newAdmin.save();
        console.log('\n==================================================');
        console.log('✅ SUPER_ADMIN ACCOUNT PROVISIONED SUCCESSFULLY');
        console.log('==================================================');
        console.log(` Name:     ${newAdmin.name}`);
        console.log(` Email:    ${newAdmin.email}`);
        console.log(` Role:     ${newAdmin.role}`);
        console.log(` Status:   Active`);
        console.log(` ID:       ${newAdmin._id}`);
        console.log('==================================================\n');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Admin provisioning failed:', error.message);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
}
createAdmin();
