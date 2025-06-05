import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frontend-take-home.fetch.com",
        port: "",
        pathname: "/dog-images/**",
      },
    ],
  },
};

export default nextConfig;
