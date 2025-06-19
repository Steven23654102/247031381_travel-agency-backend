// backend/src/routes/favorite.routes.ts
import Router from 'koa-router';
import { addFavorite, getFavorites } from '../controllers/favorite.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = new Router({ prefix: '/api/favorites' });

router.post('/', authMiddleware, addFavorite);
router.get('/', authMiddleware, getFavorites);

export default router;
