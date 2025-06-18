import Router from 'koa-router';
import Hotel from '../models/Hotel';
import { verifyToken } from '../middleware/authMiddleware';
import axios from 'axios';
import crypto from 'crypto';
import dayjs from 'dayjs';

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

// 新增整合 Hotelbeds API 的 endpoint
router.get('/hotelbeds', async ctx => {
  try {
    const { signature } = buildSignature(); // 加上簽名產生

    const response = await axios.get(
      'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels',
      {
        headers: {
          'Api-key'     : process.env.HOTELBEDS_API_KEY!,
          'X-Signature' : signature, // 🔐 加上這行
          'Accept'      : 'application/json',
        },
        params: {
          destination: ctx.query.city || 'PAR',
          from: 1,
          to: 10,
          language: 'ENG'
        }
      }
    );

    const rawHotels = response.data.hotels;
    const hotels = rawHotels.map((hotel: any) => ({
      name: hotel.name.content,
      category: hotel.categoryCode,
      destination: hotel.destinationCode
    }));

    ctx.body = { hotels };
  } catch (err: any) {
    ctx.status = err.response?.status || 500;
    ctx.body = {
      error: 'Failed to fetch Hotelbeds Content API data',
      details: err.response?.data || err.message
    };
  }
});






function buildSignature() {
  const apiKey = process.env.HOTELBEDS_API_KEY!;
  const secret = process.env.HOTELBEDS_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  const raw = apiKey + secret + timestamp;
  const signature = crypto.createHash('sha256').update(raw).digest('hex');
  return { signature, timestamp };
}

export default router;
