import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "node:fs";
let aulaApiOrigin = '';

export default defineConfig({
  plugins: [react(), {
    name: 'aula-public-api-config',
    configResolved(config) {
      aulaApiOrigin = (config.env.VITE_API_URL || '').replace(/\/+$/, '');
    },
    configureServer(server) {
      server.middlewares.use('/aula-aventura/aula-config.js', (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(`window.AULA_CONFIG = ${JSON.stringify({apiOrigin: aulaApiOrigin})};`);
      });
    },
    writeBundle(options) {
      const target = path.resolve(options.dir || 'dist', 'aula-aventura', 'aula-config.js');
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.writeFileSync(target, `window.AULA_CONFIG = ${JSON.stringify({apiOrigin: aulaApiOrigin})};\n`);
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
