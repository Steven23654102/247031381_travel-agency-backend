// backend/src/models/booking.model.ts
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  guestEmail: String,
  checkInDate: String,
  stayDays: Number,
  note: String,
  rating: Number,
  sequence: Number
});

export default mongoose.model('Booking', bookingSchema);
