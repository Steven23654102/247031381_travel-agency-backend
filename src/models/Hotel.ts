import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  price: Number,
  image: String,
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
