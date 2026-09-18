import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The contact route reads its email HTML off disk at runtime. File tracing
  // can't see a path built from process.cwd(), so ship the folder explicitly.
  outputFileTracingIncludes: {
    "/api/contact": ["./emails/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Link-preview cards: fetchable by social crawlers (robots.txt allows
      // them), but kept out of image search.
      ...["/opengraph-image", "/blog/opengraph-image", "/blog/:slug/opengraph-image"].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      })),
    ];
  },
};

// withContentCollections must be the outermost plugin
export default withContentCollections(nextConfig);
