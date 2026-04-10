import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		target: "esnext",
		minify: "esbuild",
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes("node_modules")) {
						if (
							id.includes("react") ||
							id.includes("react-dom") ||
							id.includes("react-router")
						) {
							return "vendor-react"
						}
						if (id.includes("firebase")) {
							return "vendor-firebase"
						}
						return "vendor-other"
					}
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
