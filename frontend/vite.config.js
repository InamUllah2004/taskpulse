// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // or react if you're using React

export default defineConfig({
  plugins: [vue()],
 //base: '/taskpulse/', // 👈 IMPORTANT: use your repo name here with trailing slash
})
 