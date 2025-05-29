// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Explicitly use the @tailwindcss/postcss plugin
    "@tailwindcss/postcss": {
      // Optional: If your tailwind.config.ts is NOT in the root, specify the path.
      // If it IS in the root, this 'config' line is usually not needed.
      // config: './tailwind.config.ts'
    },
    autoprefixer: {},
  },
};

export default config;
