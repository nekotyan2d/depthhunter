import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vue: ["vue", "vue-router", "pinia"],
                    three: ["three"],
                },
            },
        },
    },
});
