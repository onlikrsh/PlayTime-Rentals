import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Makes `npm run dev` behave like Vercel: /api/* runs the functions in api/,
// and /admin serves the admin app.
function devServer() {
  return {
    name: 'playtime-dev-server',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value

      server.middlewares.use(async (req, res, next) => {
        const path = req.url.split('?')[0]
        if (path === '/admin' || path.startsWith('/admin/')) {
          req.url = '/admin.html'
          return next()
        }
        const fn = path.match(/^\/api\/([a-z-]+)$/)?.[1]
        if (!fn) return next()
        try {
          const { default: handler } = await server.ssrLoadModule(`/api/${fn}.js`)
          await handler(req, res)
        } catch (err) {
          server.ssrFixStacktrace(err)
          console.error(err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devServer()],
  build: {
    rolldownOptions: {
      input: { main: 'index.html', admin: 'admin.html' },
    },
  },
})
