/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    loader:"akamai",
    path: "/assets/",
  },
};

export default nextConfig;
