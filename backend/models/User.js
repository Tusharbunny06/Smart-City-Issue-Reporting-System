const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'worker', 'admin'], 
    default: 'citizen' 
  },
  specialty: {
    type: String,
    enum: ['garbage', 'road', 'water', 'electricity', 'other']
  },
  shiftStart: { type: Number },
  shiftEnd: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
