import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import contactHandler from './api/contact.js';

// Vite plugin to emulate the Vercel serverless function (/api/contact) during local development (astro dev)
function devContactApiPlugin() {
  return {
    name: 'dev-contact-api',
    apply: 'serve', // Only active during 'astro dev'
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/contact' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const mockRes = {
                status(code) {
                  res.statusCode = code;
                  return this;
                },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                setHeader(name, val) {
                  res.setHeader(name, val);
                  return this;
                },
              };
              await contactHandler(req, mockRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://mariajoseduartebarriopsicologia.com',
  vite: {
    plugins: [devContactApiPlugin()],
  },
});
