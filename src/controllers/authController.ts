// src/controllers/authController.ts
import Router from 'koa-router';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = new Router({ prefix: '/api/auth' });

router.post('/register', async (ctx) => {
  const body = ctx.request.body as {
    email: string;
    password: string;
    signupCode: string;
  };

  const { email, password, signupCode } = body;

  // 加入 signup code 驗證
  if (signupCode !== 'VT2025') {
    ctx.status = 403;
    ctx.body = { error: 'Invalid signup code' };
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    ctx.status = 400;
    ctx.body = { error: 'Email already registered' };
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ email, passwordHash });
  await user.save();

  ctx.body = { message: 'Registered successfully' };
});

router.post('/login', async (ctx) => {
  const body = ctx.request.body as {
    email: string;
    password: string;
  };

  const { email, password } = body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    ctx.status = 401;
    ctx.body = { error: 'Invalid credentials' };
    return;
  }

  const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY', { expiresIn: '1h' });

  ctx.body = { token, role: user.role };
});

export default router;
