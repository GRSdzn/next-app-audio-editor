/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Удалить serverComponentsExternalPackages
  },
  serverExternalPackages: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
