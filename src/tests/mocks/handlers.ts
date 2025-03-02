import { rest } from 'msw';
import { mockReportData, mockSELResponses } from './fixtures';

export const handlers = [
  rest.get('/api/report', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId');
    if (!userId) {
      return res(ctx.status(400), ctx.json({ error: 'userId is required' }));
    }
    return res(ctx.json(mockReportData));
  }),

  rest.get('/api/sel-responses', (req, res, ctx) => {
    return res(ctx.json(mockSELResponses));
  }),

  rest.post('/api/sel-responses', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json({ id: 'new-response-id', ...body }));
  }),
]; 