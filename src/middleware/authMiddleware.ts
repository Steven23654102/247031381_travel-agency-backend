//authMiddleware.ts
import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function verifyToken(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Missing or invalid token' };
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    let decoded;

    // 嘗試用 user 的密鑰驗證
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      // 若失敗，再嘗試用 admin 的密鑰
      decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    }

    ctx.state.user = decoded as {
      id: string;
      role: string;
      email: string;
    };

    await next();
  } catch (err) {
    ctx.status = 403;
    ctx.body = { error: 'Token verification failed' };
  }
}


export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { error: '未提供 token' };
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 403;
    ctx.body = { error: 'token 驗證失敗' };
  }
};