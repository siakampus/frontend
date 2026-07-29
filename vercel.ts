import { routes, type VercelConfig } from '@vercel/config/v1';

const BASE_API = process.env.BASE_API || 'https://your-backend-api.com';

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/(.*)', `${BASE_API}/api/$1`),
  ],
};