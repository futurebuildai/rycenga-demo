import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        {
            name: 'admin-rewrites',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url || '';
                    if (url.startsWith('/admin') && !url.includes('.') && req.headers.accept?.includes('text/html')) {
                        req.url = '/admin.html';
                    }
                    next();
                });
            }
        }
    ],
    root: '.',
    build: {
        target: 'esnext',
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
        },
    },
    server: {
        proxy: {
            '/api/v1': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
