/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@puppeteer/browsers'],
  },
};
export default nextConfig;
