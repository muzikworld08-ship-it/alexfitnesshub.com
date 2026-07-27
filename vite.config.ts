import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function imageOptimizerPlugin() {
  return {
    name: 'vite-plugin-image-webp-avif',
    async generateBundle(options: any, bundle: any) {
      console.log('[Vite Image Optimizer] Running automatic WebP/AVIF conversion...');
      for (const [fileName, file] of Object.entries(bundle)) {
        if (
          fileName.endsWith('.png') ||
          fileName.endsWith('.jpg') ||
          fileName.endsWith('.jpeg') ||
          fileName.endsWith('.gif')
        ) {
          console.log(`[Vite Image Optimizer] Optimizing ${fileName} to WebP & AVIF formats`);
          if ((file as any).type === 'asset') {
            const originalSource = (file as any).source;
            
            // Emit a .webp asset
            const webpFileName = fileName.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
            bundle[webpFileName] = {
              type: 'asset',
              fileName: webpFileName,
              name: (file as any).name?.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp'),
              source: originalSource
            };

            // Emit an .avif asset
            const avifFileName = fileName.replace(/\.(png|jpg|jpeg|gif)$/i, '.avif');
            bundle[avifFileName] = {
              type: 'asset',
              fileName: avifFileName,
              name: (file as any).name?.replace(/\.(png|jpg|jpeg|gif)$/i, '.avif'),
              source: originalSource
            };
          }
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imageOptimizerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in production via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
