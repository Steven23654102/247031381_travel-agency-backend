// backend/src/controllers/favorite.controller.ts
import { Context } from 'koa';
import { Favorite } from '../models/favorite.model';

export const addFavorite = async (ctx: Context) => {
  const { hotelId } = ctx.request.body;
  const userEmail = ctx.state.user.email; // JWT解碼後

  const exists = await Favorite.findOne({ userEmail, hotelId });
  if (exists) {
    ctx.status = 400;
    ctx.body = { error: '已經收藏過了' };
    return;
  }

  const fav = new Favorite({ userEmail, hotelId });
  await fav.save();
  ctx.body = { message: ' 已加入收藏' };
};

export const getFavorites = async (ctx: Context) => {
  const userEmail = ctx.state.user.email;
  const favorites = await Favorite.find({ userEmail }).populate('hotelId');
  ctx.body = favorites.map(f => f.hotelId);
};
