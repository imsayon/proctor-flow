import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		target: "esnext",
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
			},
		},
		rollupOptions: {
			output: {
				manualChunks: {
					"vendor-react": ["react", "react-dom", "react-router-dom"],
					"vendor-firebase": ["firebase"],
				},
			},
		},
		sourcemap: false,
		outDir: "dist",
	},
	optimizeDeps: {
		include: ["react", "react-dom", "firebase"],
	},
})
