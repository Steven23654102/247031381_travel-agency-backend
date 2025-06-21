import Router from 'koa-router';
import passport from '../auth/passport';
import jwt from 'jsonwebtoken';

const router = new Router({ prefix: '/api/auth' });

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (ctx) => {
    const user = ctx.state.user;
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    ctx.redirect(`http://localhost:3001/dashboard?token=${token}`);
  }
);

export default router;
