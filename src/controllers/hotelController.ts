import Router from 'koa-router';
import Hotel from '../models/Hotel';
import { verifyToken } from '../middleware/authMiddleware';

const router = new Router({ prefix: '/api/hotels' });

//  定義型別（也可以放到 types 檔案中）
interface HotelInput {
  name: string;
  city: string;
  price: number;
  image: string;
}


//  取得所有飯店（支援搜尋與篩選）
router.get('/', async ctx => {
  const { city, priceMin, priceMax, keyword } = ctx.query;

  const query: any = {};
  if (city) query.city = city;
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  const hotels = await Hotel.find(query);
  ctx.body = hotels;
});


//  新增飯店（需登入）
router.post('/', verifyToken, async ctx => {
  const newHotel = new Hotel(ctx.request.body as HotelInput);
  await newHotel.save();
  ctx.body = { message: 'Hotel created', hotel: newHotel };
});

//  更新飯店（需登入）
router.put('/:id', verifyToken, async ctx => {
  const updated = await Hotel.findByIdAndUpdate(
    ctx.params.id,
    ctx.request.body as Partial<HotelInput>,
    { new: true }
  );
  if (!updated) {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
    return;
  }
  ctx.body = { message: 'Hotel updated', hotel: updated };
});

//  刪除飯店（需登入）
router.delete('/:id', verifyToken, async ctx => {
  const deleted = await Hotel.findByIdAndDelete(ctx.params.id);
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
    return;
  }
  ctx.body = { message: 'Hotel deleted' };
});

export default router;
