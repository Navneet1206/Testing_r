import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickup: {
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  },
  dropoff: {
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  },
  distance: Number,
  fare: Number,
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'sedan', 'suv'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  feedback: {
    passengerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    driverRating: {
      type: Number,
      min: 1,
      max: 5
    },
    passengerComment: String,
    driverComment: String
  }
}, {
  timestamps: true
});

rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'dropoff.location': '2dsphere' });

export default mongoose.model('Ride', rideSchema);