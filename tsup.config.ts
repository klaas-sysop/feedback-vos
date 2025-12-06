import { defineConfig } from 'tsup';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'next'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    // Build CSS
    const cssContent = readFileSync(join(__dirname, 'src/styles.css'), 'utf-8');
    const result = await postcss([tailwindcss, autoprefixer]).process(cssContent, {
      from: undefined,
    });
    
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    writeFileSync(join(__dirname, 'dist/styles.css'), result.css);
  },
});

