import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.voltpin.in',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api.voltpin.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.leafstore.in',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api.leafstore.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.zorotopup.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.zorotopup.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api.zorotopup.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'voltpin.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.voltpin.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'leafstore.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.leafstore.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zorotopup.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.zorotopup.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
