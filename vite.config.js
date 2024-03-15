import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'main-chat': resolve(__dirname, 'main-chat/index.html'),
      },
    },
  },
})