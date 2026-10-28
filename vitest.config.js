import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { alias } from './vite.config.js'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias },
  test: {
    environment: 'happy-dom',
    include: ['resources/js/__tests__/**/*.spec.js'],
    restoreMocks: true
  }
})
