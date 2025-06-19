// backend/src/controllers/hotelController.ts
import Router from 'koa-router';
import Hotel from '../models/Hotel';
import { verifyToken } from '../middleware/authMiddleware';
import axios from 'axios';
import crypto from 'crypto';
import dayjs from 'dayjs';
import Booking from '../models/booking.model';

const router = new Router({ prefix: '/api/hotels' });

//  定義完整型別（建議日後可移至 types 檔）
interface HotelInput {
  name: string;
  destination: string;
  minRate: number;
  phone: string;
  description: string;
}

interface BookingInput {
  hotelId: string;
  guestEmail: string;
  checkInDate: string;
  stayDays: number;
  note?: string;
  rating?: number;
}


//  查詢飯店（支援篩選）
router.get('/', async ctx => {
  const { city, priceMin, priceMax, keyword } = ctx.query;

  const query: any = {};
  if (city) query.destination = city;
  if (priceMin || priceMax) {
    query.minRate = {};
    if (priceMin) query.minRate.$gte = Number(priceMin);
    if (priceMax) query.minRate.$lte = Number(priceMax);
  }
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  const hotels = await Hotel.find(query);
  ctx.body = hotels;
});

//  新增飯店（需登入）
router.post('/', verifyToken, async ctx => {
  try {
    const {
      name,
      destination,
      minRate,
      phone,
      description
    } = ctx.request.body as HotelInput;

    const newHotel = new Hotel({
      name,
      destination,
      minRate,
      phone,
      description
    });

    await newHotel.save();
    ctx.body = { message: ' 新增成功', hotel: newHotel };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: ' 伺服器錯誤，無法新增飯店' };
  }
});


//  更新飯店
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

//  刪除飯店
router.delete('/:id', verifyToken, async ctx => {
  const deleted = await Hotel.findByIdAndDelete(ctx.params.id);
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Hotel not found' };
    return;
  }
  ctx.body = { message: 'Hotel deleted' };
});

//  Hotelbeds API (簡化)
router.get('/hotelbeds', async ctx => {
  try {
    const { signature } = buildSignature();
    const response = await axios.get(
      'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels',
      {
        headers: {
          'Api-key': process.env.HOTELBEDS_API_KEY!,
          'X-Signature': signature,
          'Accept': 'application/json',
        },
        params: {
          destination: ctx.query.city || 'PAR',
          from: 1,
          to: 10,
          language: 'ENG',
        },
      }
    );

    const rawHotels = response.data.hotels;
    const hotels = rawHotels.map((hotel: any) => ({
      name: hotel.name.content,
      category: hotel.categoryCode,
      destination: hotel.destinationCode,
    }));

    ctx.body = { hotels };
  } catch (err: any) {
    ctx.status = err.response?.status || 500;
    ctx.body = {
      error: 'Failed to fetch Hotelbeds Content API data',
      details: err.response?.data || err.message,
    };
  }
});

router.get('/hotelbeds/raw', async ctx => {
  const { signature } = buildSignature();

  const response = await axios.get(
    'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels',
    {
      headers: {
        'Api-key': process.env.HOTELBEDS_API_KEY!,
        'X-Signature': signature,
        'Accept': 'application/json',
      },
      params: {
        destination: 'PAR',
        from: 1,
        to: 1,
        language: 'ENG',
      },
    }
  );

  ctx.body = response.data;
});


// 查詢單一飯店
router.get('/:id', async ctx => {
  try {
    const hotel = await Hotel.findById(ctx.params.id);
    if (!hotel) {
      ctx.status = 404;
      ctx.body = { error: 'Hotel not found' };
      return;
    }
    ctx.body = hotel;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Server error', detail: err };
  }
});

router.post('/bookings', async ctx => {
  try {
    const total = await Booking.countDocuments();

    interface BookingInput {
      hotelId: string;
      guestEmail: string;
      checkInDate: string;
      stayDays: number;
      note?: string;
      rating?: number;
    }

    const {
      hotelId, guestEmail, checkInDate, stayDays, note, rating
    } = ctx.request.body as BookingInput;

    const newBooking = new Booking({
      hotelId,
      guestEmail,
      checkInDate,
      stayDays,
      note,
      rating,
      sequence: total + 1
    });

    await newBooking.save();
    ctx.body = { message: '預約成功', booking: newBooking };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: '無法建立預約', detail: err };
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
