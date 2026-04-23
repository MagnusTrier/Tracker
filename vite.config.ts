import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [
		react(),
	],
	server: {
		host: "0.0.0.0",
		allowedHosts: [".loca.lt", "192.168.50.45.nip.io"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes("node_modueles/framer-motion") || id.includes("node_modules/motion") || id.includes("node_modules/@motionone")) {
						return "vendor-motion"
					}
					if (id.includes("node_modules/d3")) {
						return "vendor-d3"
					}
					if (id.includes("node_modules/date-fns")) {
						return "vendor-utils"
					}
					if (id.includes("node_modules/@supabase")) {
						return "vendor-supabase"
					}
					if (id.includes("node_modules/swiper")) {
						return "vendor-swiper"
					}
				}
			}
		}
	}
})
