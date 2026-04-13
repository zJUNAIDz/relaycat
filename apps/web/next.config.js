// /** @type {import('next').NextConfig} */
// const withbundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });
const nextConfig = {
  // output: "standalone",

  images: {
    qualities: [30, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "global.discourse-cdn.com",
        pathname:
          "/turtlehead/original/2X/c/c830d1dee245de3c851f0f88b6c57c83c69f3ace.png",
      },
      {
        protocol: "https",
        hostname: "s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdnb.artstation.com",
        pathname: "/**",
      },
      // {
      //   protocol: "http",
      //   hostname: "localhost",
      //   port: "4566",
      //   pathname: "/**",
      // },
      {
        protocol: "https",
        hostname: "localhost.localstack.cloud",
        port: "4566",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
