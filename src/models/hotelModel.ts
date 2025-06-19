// backend/src/models/hotelModel.ts
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    destination: { type: String, required: true },
    minRate: { type: Number, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
