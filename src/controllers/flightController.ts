// src/controllers/flightController.ts
import Router from 'koa-router';
import axios from 'axios';

const router = new Router({ prefix: '/api/flights' });

router.get('/search', async ctx => {
  const { from, to, date } = ctx.query as Record<string, string>;

  if (!from || !to || !date) {
    ctx.status = 400;
    ctx.body  = { error: 'from、to、date 皆為必填' };
    return;
  }

  try {
    const response = await axios.get(
      'https://google-flights2.p.rapidapi.com/api/v1/searchFlights',
      {
        params: {
  departure_id: from,
  arrival_id: to,
  outbound_date: date,
  return_date: date,
  show_hidden: '0',                
  currency: 'USD',
  travel_class: 'ECONOMY',
  adults: '1',
  country_code: 'US',
  language_code: 'en-US'        
},

        headers: {
          'x-rapidapi-key':  process.env.RAPID_KEY!,
          'x-rapidapi-host': 'google-flights2.p.rapidapi.com'
        },
        timeout: 10000
      }
    );

    /*  調試：印出完整 JSON，方便你看到實際欄位 */
    //console.dir(response.data, { depth: null });

    ctx.body = response.data;          // 直接回傳給前端
  } catch (error: any) {
    /* 錯誤也印出來，方便排錯 */
    console.error(' Flight API error:', error?.response?.data || error.message);

    ctx.status = error?.response?.status || 500;
    ctx.body   = { error: '查詢失敗', details: error?.response?.data || error.message };
  }
});

export default router;
