/**
 * src/controllers/authController.ts
 * ---------------------------------
 * 使用：
 *   prefix    : /api/auth
 *   POST /register  – 旅遊社職員註冊（需 signupCode）
 *   POST /login     – 任何已註冊使用者登入，回傳 JWT
 */

import Router from 'koa-router';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/User';

dotenv.config();                      // 讀取 .env 內 JWT_SECRET 等設定

const router = new Router({ prefix: '/api/auth' });

// --------------------------------------------------
//  POST /api/auth/register
// --------------------------------------------------
router.post('/register', async (ctx) => {
  const { email, password, signupCode } = ctx.request
    .body as { email: string; password: string; signupCode: string };

  /*── 1) 驗證註冊碼 ───────────────────────────────*/
  // 只有內部職員拿得到正確代碼 (題目需求)
  if (signupCode !== 'VT2025') {
    ctx.status = 403;
    ctx.body   = { error: 'Invalid signup code' };
    return;
  }

  /*── 2) 檢查帳號是否已存在 ─────────────────────*/
  if (await User.findOne({ email })) {
    ctx.status = 400;
    ctx.body   = { error: 'Email already registered' };
    return;
  }

  /*── 3) 建立新使用者 ───────────────────────────*/
  const passwordHash = await bcrypt.hash(password, 10);
  const user         = new User({ email, passwordHash, role: 'operator' });
  await user.save();

  ctx.body = { message: 'Registered successfully' };
});

// --------------------------------------------------
//  POST /api/auth/login
// --------------------------------------------------
router.post('/login', async (ctx) => {
  const { email, password } = ctx.request
    .body as { email: string; password: string };

  /*── 1) 找使用者 ───────────────────────────────*/
  const user = await User.findOne({ email });

  /*── 2) 驗證密碼 ───────────────────────────────*/
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    ctx.status = 401;
    ctx.body   = { error: 'Invalid credentials' };
    return;
  }

  /*── 3) 產生 JWT ──────────────────────────────*/
  // 必須先在 backend/.env 內加入 JWT_SECRET=value
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  ctx.body = { token, role: user.role };
});

export default router;
