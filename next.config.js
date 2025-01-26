/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
        },
      },
    });
    return config;
  },
}

module.exports = nextConfig
