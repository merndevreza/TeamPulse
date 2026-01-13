import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [ 
                "img-src 'self' data: https:", // Allow images from self, data URIs, and any HTTPS source
                "font-src 'self' data:", // Allow fonts from self and data URIs
                `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL}`, // Allow API calls to self and the specified API base URL
              ].join('; '),
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',  // Blocks embedding in iframes
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',   // Stops a class of attacks where a malicious file (e.g., pretending to be CSS but containing JS) could execute code
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',  // Don't send full URL to other origins, just the origin
            },
          ],
        },
      ];
    },

   images: {
    remotePatterns: [new URL('https://avatars.githubusercontent.com/u/188235747?v=4')],
  },

    async redirects() {
    return [
      {
        source: "/about-me",
        destination: "/about-me/summary",
        permanent: true,
      },
      {
        source: "/about-others/:id",
        destination: "/about-others/:id/summary",
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
