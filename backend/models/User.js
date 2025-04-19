const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  avatar: { type: String }, // URL for the avatar image
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Role-based access control
  profiles: [
    {
      type: {
        type: String, // e.g., "job", "travel"
        required: true,
      },
      data: { type: mongoose.Schema.Types.Mixed }, // Flexible data structure for profiles
    },
  ],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
