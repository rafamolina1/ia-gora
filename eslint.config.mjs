import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "out/**",
      "public/sw.js",
      "public/workbox-*.js",
    ],
  },
];

export default eslintConfig;
