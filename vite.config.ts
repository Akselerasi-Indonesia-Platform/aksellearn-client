import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL || env.API_URL || 'http://127.0.0.1:3000'

  return {
    plugins: [
      tanstackStart(),
      react({
        jsxRuntime: 'automatic',
      }),
      nitro({
        handlers: [
          {
            route: '/api-proxy/**',
            handler: 'src/server/api-proxy.ts',
          },
        ],
        plugins: [
          'src/server/plugins/license-validator.ts',
          'src/server/plugins/logger.ts',
        ],
      }),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['plyr', 'hls.js'],
    },
    server: {
      proxy: {
        '^/api(?!-proxy)': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/storage': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
