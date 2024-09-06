import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, UserConfig } from 'vite';
import checker from 'vite-plugin-checker';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
	const __dirname = dirname(fileURLToPath(import.meta.url));

	const options: UserConfig = {
		cacheDir: resolve(__dirname, './.temp/vite'),
		root: resolve(__dirname, './src'),
		resolve: {
			preserveSymlinks: false,
			alias: {
				'@assets': resolve(__dirname, 'src/assets'),
			},
		},
		json: {
			namedExports: false,
			stringify: true,
		},
		server: {
			host: true,
			port: 46666,
			strictPort: true,
			open: false,
		},
		build: {
			outDir: resolve(__dirname, './lib'),
			assetsDir: 'assets',
			assetsInlineLimit: 0,
			sourcemap: true,
			manifest: resolve(__dirname, './lib/manifest.json'),
			minify: false,
			cssMinify: false,
			reportCompressedSize: false,
		},
		esbuild: {},
		define: {},
		// publicDir: resolve(__dirname, '../static'),
		plugins: [
			vue(),
			vueDevTools(),
			checker({
				overlay: false,
				root: resolve(__dirname, './src'),
				// typescript: {
				// 	root: __dirname,
				// 	tsconfigPath: 'tsconfig.app.json',
				// },
				vueTsc: {
					root: __dirname,
					tsconfigPath: 'tsconfig.app.json',
				},
			}),
		],
	};

	if (command === 'serve') {
	} else {
		options.clearScreen = false;
	}

	return options;
});
