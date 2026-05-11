import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://flagcdn.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://cartocdn.com https://unpkg.com https://vercel.live",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://nczkvsnuafkwtmgokiuo.supabase.co https://api.groq.com https://api.resend.com https://api.stripe.com https://va.vercel-scripts.com https://vercel.live https://earthquake.usgs.gov wss://ws-us*.pusher.com wss://ws-eu*.pusher.com",
  "frame-src 'self' https://challenges.cloudflare.com https://stripe.com https://js.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'flagcdn.com' },
      { hostname: 'nczkvsnuafkwtmgokiuo.supabase.co' },
      { hostname: 'www.viajeinteligencia.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'viajeinteligencia.com' }],
        destination: 'https://www.viajeinteligencia.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '0' },
        ],
      },
    ];
  },
  output: 'standalone',
  poweredByHeader: false,
};

export default nextConfig;
