import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: {
      values: ['Vallabh Vidyanagar', 'Karamsad'],
      message: 'SattvicBites delivers only to Vallabh Vidyanagar and Karamsad'
    }
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    enum: {
      values: ['388120', '388325'],
      message: 'SattvicBites delivers only to Pincodes 388120 and 388325'
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  streetAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Enforce consistent mapping between city and pincode at the database hook level
userSchema.pre('save', async function (next) {
  // Hash password before saving if it is modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Cross field geofence match validation
  if (this.city === 'Vallabh Vidyanagar' && this.pincode !== '388120') {
    return next(new Error('Validation failed: Pincode 388120 is required for Vallabh Vidyanagar'));
  }
  if (this.city === 'Karamsad' && this.pincode !== '388325') {
    return next(new Error('Validation failed: Pincode 388325 is required for Karamsad'));
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
