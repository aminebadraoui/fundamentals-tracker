/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    loader:"akamai",
    path: "/assets/",
  },
    experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
    runtime: 'experimental-edge',
  }
};

export default nextConfig;
