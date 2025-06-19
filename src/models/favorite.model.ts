// backend/src/models/favorite.model.ts
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
});

export const Favorite = mongoose.model('Favorite', favoriteSchema);
