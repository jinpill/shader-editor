/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      exclude: /node_modules/,
      use: "raw-loader",
    });
    return config;
  },
};

export default nextConfig;
