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
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
    role: string;
    email: string;
  };
  ctx.state.user = decoded; //  確保能從 ctx.state.user.email 取得 email
  await next();
} catch (err) {
  ctx.status = 403;
  ctx.body = { error: 'Token verification failed' };
}

}
