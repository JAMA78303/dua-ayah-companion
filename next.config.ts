import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxAgeSeconds: 86400 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-files",
          expiration: { maxAgeSeconds: 86400 * 365 },
        },
      },
      {
        urlPattern: /\/api\/daily/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "daily-recommendation",
          networkTimeoutSeconds: 5,
          expiration: { maxAgeSeconds: 86400 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
