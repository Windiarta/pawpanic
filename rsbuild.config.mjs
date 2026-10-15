import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  html: {
    template: './src/index.html',
    title: 'PAW PANIC! - 2 Player Co-Op Online',
    favicon: './public/pawpanic.svg',
  },
  source: {
    entry: {
      index: './src/index.js',
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});
