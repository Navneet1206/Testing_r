import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['passenger', 'driver', 'admin'],
    default: 'passenger'
  },
  phone: String,
  profilePhoto: String,
  documents: {
    aadhar: {
      front: String,
      back: String
    },
    license: {
      front: String,
      back: String
    },
    vehicle: {
      type: { 
        type: String,
        enum: ['bike', 'auto', 'sedan', 'suv']
      },
      registrationNumber: String,
      insurance: String
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);