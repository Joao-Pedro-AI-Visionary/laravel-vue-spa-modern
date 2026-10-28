import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'

// Absolute alias paths (fileURLToPath) so resolution never depends on the
// working directory or on a case-insensitive filesystem (upstream #330).
export const alias = {
  '~': fileURLToPath(new URL('./resources/js', import.meta.url))
}

export const scssOptions = {
  // Bootstrap 5.3 still uses @import and legacy color functions internally.
  quietDeps: true,
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
}

export default defineConfig(({ mode }) => {
  const demo = mode === 'demo' || process.env.VITE_DEMO_MODE === 'true'

  const vuePlugin = vue({
    template: {
      transformAssetUrls: { base: null, includeAbsolute: false }
    }
  })

  return {
    resolve: { alias },
    define: {
      'import.meta.env.VITE_DEMO_MODE': JSON.stringify(demo ? 'true' : 'false'),
      __VUE_OPTIONS_API__: 'false',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      __VUE_I18N_FULL_INSTALL__: 'true',
      __VUE_I18N_LEGACY_API__: 'false',
      __INTLIFY_PROD_DEVTOOLS__: 'false'
    },
    css: {
      preprocessorOptions: { scss: scssOptions }
    },
    plugins: demo
      ? [vuePlugin]
      : [
          laravel({
            input: ['resources/js/app.js'],
            refresh: true
          }),
          vuePlugin
        ],
    // Demo mode: static SPA built from the root index.html.
    ...(demo && {
      base: '/',
      build: { outDir: 'dist-demo', emptyOutDir: true }
    })
  }
})
