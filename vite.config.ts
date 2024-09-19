import { existsSync, lstatSync, readdirSync, renameSync, rm } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mpa from 'vite-plugin-multi-pages'

const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		mpa({
			scanDir: 'src/pages',
			defaultEntries: 'search',
		}),
		// Source: https://dev.to/onticdani/how-to-load-and-render-markdown-files-into-your-vite-react-app-using-typescript-26jm
		{
			name: 'markdown-loader',
			transform(code, id) {
				if (id.slice(-3) === '.md') {
					return `export default ${JSON.stringify(code)}`
				}
			},
		},
		{
			name: 'after-build',
			apply: 'build',
			enforce: 'post',
			closeBundle() {
				const pagesDir = 'dist/src/pages'
				if (!existsSync(pagesDir)) return
				for (const folder of readdirSync(pagesDir)) {
					const folderPath = path.join(pagesDir, folder)
					if (lstatSync(folderPath).isDirectory()) {
						const indexPath = path.join(folderPath, 'index.html')
						if (existsSync(indexPath)) {
							const pathToMove = `dist/${folder}.html`
							console.log(`${indexPath} -> ${pathToMove}`)
							renameSync(indexPath, pathToMove)
						} else {
							console.log(`${folder} does not have an index.html file`)
						}
					}
				}
				rm('dist/src', { recursive: true }, (err) => {
					if (err) console.error(err)
				})
			},
		},
	],
	appType: 'mpa',
	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
})
