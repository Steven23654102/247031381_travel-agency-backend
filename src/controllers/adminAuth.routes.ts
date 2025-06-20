// src/controllers/adminAuth.routes.ts
import Router     from 'koa-router';
import bcrypt     from 'bcrypt';
import jwt        from 'jsonwebtoken';
import Admin      from '../models/Admin';
import { verifyToken } from '../middleware/authMiddleware';

const router = new Router({ prefix: '/api/admin' });

/* -------------------------  Admin 註冊  ------------------------- */
router.post('/register', async ctx => {
  const { email, password, code } =
    ctx.request.body as { email: string; password: string; code: string };

  /* 驗證註冊碼 -------------------------------------------------- */
  if (code !== process.env.ADMIN_SIGNUP_CODE) {
    ctx.throw(403, '註冊碼錯誤');               // ← 回傳錯誤
    return;                                    // ← 讓 TS 知道「下面的程式跑不到」
  }

  /* 檢查信箱是否已存在 ------------------------------------------ */
  if (await Admin.exists({ email })) {
    ctx.throw(400, '此 email 已存在');
    return;
  }

  /* 建立帳號 ---------------------------------------------------- */
  const passwordHash = await bcrypt.hash(password, 10);
  const admin        = await Admin.create({ email, passwordHash });

  ctx.body = {
    message : ' Admin 註冊成功',
    admin   : { email: admin.email },
  };
});

/* -------------------------  Admin 登入  ------------------------- */
router.post('/login', async ctx => {
  const { email, password } =
    ctx.request.body as { email: string; password: string };

  /* 先找帳號 ---------------------------------------------------- */
  const admin = await Admin.findOne({ email });

  if (!admin) {                              // 找不到
    ctx.throw(401, '登入失敗：找不到管理員');
    return;
  }

  /* 驗證密碼 ---------------------------------------------------- */
  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    ctx.throw(401, '登入失敗：密碼錯誤');
    return;
  }

  /* 發 JWT ------------------------------------------------------ */
  const token = jwt.sign(
  { id: admin._id, role: 'admin', email: admin.email },
  process.env.JWT_SECRET!,
  { expiresIn: '2h' }
);


  ctx.body = { message: '登入成功', token };
});

/* -------------------------  Admin 資料 ------------------------- */
router.get('/profile', verifyToken, async ctx => {
  const email = ctx.state.user.email;
  const admin = await Admin.findOne({ email }).select('-passwordHash');

  if (!admin) {
    ctx.throw(404, '找不到管理員');
    return;
  }

  ctx.body = { admin };
});

export default router;
