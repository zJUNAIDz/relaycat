/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
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
      {
        protocol:"http",
        hostname:"localhost",
        pathname:"/**"
      }
    ],
  },
};

module.exports = nextConfig;
