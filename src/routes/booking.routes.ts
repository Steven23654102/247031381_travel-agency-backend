import Router from 'koa-router';
import Booking from '../models/booking.model';
import { verifyToken } from '../middleware/authMiddleware';

const router = new Router({ prefix: '/api/bookings' });


router.get('/', verifyToken, async ctx => {
  const bookings = await Booking.find().populate('hotelId');
  ctx.body = bookings;
});

// DELETE /api/bookings/:id
router.delete('/:id', verifyToken, async ctx => {
  const { id } = ctx.params;
  await Booking.findByIdAndDelete(id);
  ctx.status = 204; // No Content
});

// GET /api/bookings/:id - 取得單筆 booking
router.get('/:id', verifyToken, async ctx => {
  const booking = await Booking.findById(ctx.params.id);
  if (!booking) {
    ctx.status = 404;
    ctx.body = { error: 'Booking not found' };
    return;
  }
  ctx.body = booking;
});


router.put('/:id', verifyToken, async ctx => {
  const { note, rating, checkInDate, stayDays } = ctx.request.body as {
    note: string;
    rating: number;
    checkInDate: string;
    stayDays: number;
  };

  const updated = await Booking.findByIdAndUpdate(
    ctx.params.id,
    { note, rating, checkInDate, stayDays },
    { new: true }
  );

  if (!updated) {
    ctx.status = 404;
    ctx.body = { error: 'Booking not found' };
    return;
  }

  ctx.body = updated;
});


export default router;
