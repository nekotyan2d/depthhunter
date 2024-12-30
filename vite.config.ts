import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const { APP_BACKEND_URL } = loadEnv("", process.cwd(), "APP_BACKEND_URL");

// https://vite.dev/config/
export default defineConfig({
    plugins: [
		vue()
	],
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern-compiler"
			}
		}
	},
	define: {
		APP_BACKEND_URL: `"${APP_BACKEND_URL}"`
	}
})
