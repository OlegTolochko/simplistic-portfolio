/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{ protocol: "https", hostname: "img.shields.io" }],
  },
  // Prevent stale HTML from referencing old chunk hashes after deploys.
  // _next/static/* is already immutable-hashed by Next.js; this ensures
  // that HTML pages themselves are revalidated on every request.
  async headers() {
    return [
      {
        source: "/:path((?!_next/static|_next/image|favicon).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
