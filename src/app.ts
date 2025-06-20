//app.ts
import dotenv from 'dotenv';
dotenv.config();
console.log(' Loaded RAPID_KEY:', process.env.RAPID_KEY);


import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static'; // 
import path from 'path';         // 

import connectDB from './config/db';
import authRoutes from './controllers/authController';
import hotelRoutes from './controllers/hotelController';
import flightRoutes from './controllers/flightController';

import adminAuthRoutes from './controllers/adminAuth.routes';

const app = new Koa();

//  新增一段中介層，顯示 API 請求紀錄
app.use(async (ctx, next) => {
  console.log('[API]', ctx.method, ctx.url); // 顯示 HTTP 方法與路徑
  await next();
});

// 加入 CORS 支援
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type']
}));



// 使用中介層
app.use(bodyParser());

connectDB();

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(hotelRoutes.routes()); // 放在 app.use(...) 區域

app.use(adminAuthRoutes.routes()).use(adminAuthRoutes.allowedMethods());


// 路由（每組掛一次，並加 allowedMethods）
app
  .use(flightRoutes.routes())
  .use(flightRoutes.allowedMethods())
  .use(authRoutes.routes())
  .use(authRoutes.allowedMethods())
  .use(hotelRoutes.routes())
  .use(hotelRoutes.allowedMethods());



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

