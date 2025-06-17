import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import connectDB from './config/db';
import authRoutes from './controllers/authController';

const app = new Koa(); 
app.use(bodyParser());

connectDB();

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
