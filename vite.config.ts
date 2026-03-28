import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from "rollup-plugin-visualizer"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		visualizer({ open: true, filename: "bundle-stats.html" })
	],
	server: {
		host: "0.0.0.0",
		allowedHosts: [".loca.lt"],
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
					if (id.includes("node_modules/react-icons")) {
						return "vendor-icons"
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
