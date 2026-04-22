const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smartcity');
        const adminExists = await User.findOne({ email: 'admin@smartcity.com' });
        
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await User.create({
                name: 'System Administrator',
                email: 'admin@smartcity.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Default Admin account created successfully! (admin@smartcity.com / admin123)');
        } else {
            console.log('⚡ Admin account already exists. You can log in with it.');
        }
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        mongoose.disconnect();
    }
};

seedAdmin();
