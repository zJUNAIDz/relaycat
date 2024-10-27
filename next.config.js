/** @type {import('next').NextConfig} */
const nextConfig = {
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
        pathname: "/turtlehead/original/2X/c/c830d1dee245de3c851f0f88b6c57c83c69f3ace.png"
      }]
  }
}

module.exports = nextConfig
