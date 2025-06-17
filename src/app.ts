import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import connectDB from './config/db';
import authRoutes from './controllers/authController';
import hotelRoutes from './controllers/hotelController'; // 放在 import 區域

const app = new Koa(); 
app.use(bodyParser());

connectDB();

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(hotelRoutes.routes()); // 放在 app.use(...) 區域

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
