import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ngrok } from "vite-plugin-ngrok";

const { NGROK_AUTH_TOKEN } = loadEnv("", process.cwd(), "NGROK_AUTH_TOKEN");
const { NGROK_DOMAIN } = loadEnv("", process.cwd(), "NGROK_DOMAIN");
const { APP_BACKEND_URL } = loadEnv("", process.cwd(), "APP_BACKEND_URL");

// https://vite.dev/config/
export default defineConfig({
    plugins: [
		vue(),
		ngrok({
			authtoken: NGROK_AUTH_TOKEN,
			domain: NGROK_DOMAIN
		})
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
