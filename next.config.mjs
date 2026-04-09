/** @type {import('next').NextConfig} */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH ?? "";

const nextConfig = {
  typedRoutes: true,
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
        assetPrefix: basePath || undefined,
        images: {
          unoptimized: true
        }
      }
    : {})
};

export default nextConfig;
