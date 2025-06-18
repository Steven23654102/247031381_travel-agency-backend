import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import connectDB from './config/db';
import authRoutes from './controllers/authController';
import hotelRoutes from './controllers/hotelController';

const app = new Koa();

// 加入 CORS 支援
app.use(cors());

// 使用中介層
app.use(bodyParser());

connectDB();

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(hotelRoutes.routes()); // 放在 app.use(...) 區域

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
