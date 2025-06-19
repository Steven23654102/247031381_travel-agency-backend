//app.ts
import dotenv from 'dotenv';
dotenv.config();


import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import connectDB from './config/db';
import authRoutes from './controllers/authController';
import hotelRoutes from './controllers/hotelController';
import favoriteRoutes from './routes/favorite.routes';


const app = new Koa();

// 加入 CORS 支援
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  allowHeaders: ['Authorization', 'Content-Type']
}));


// 使用中介層
app.use(bodyParser());

connectDB();

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(hotelRoutes.routes()); // 放在 app.use(...) 區域
app.use(favoriteRoutes.routes()).use(favoriteRoutes.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

