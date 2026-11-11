import { defineConfig, loadEnv } from 'vite';
import enhanceRealismHandler from './api/enhance-realism.js';

function decoralyLocalApiPlugin() {
  const attachMiddleware = (server) => {
    server.middlewares.use('/api/enhance-realism', async (req, res) => {
      await enhanceRealismHandler(req, res);
    });
  };

  return {
    name: 'decoraly-local-api',
    configureServer: attachMiddleware,
    configurePreviewServer: attachMiddleware
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    server: {
      port: 3000,
      open: false,
      host: true
    },
    plugins: [decoralyLocalApiPlugin()],
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

