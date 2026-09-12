import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fixes ERR_DLOPEN_FAILED on Vercel for sharp and onnxruntime-node --
  // both ship native .so binaries that Vercel's build doesn't bundle
  // by default under Turbopack, causing processPhoto() to silently
  // return null for every production user (confirmed via prod logs,
  // Sept 2026). This explicitly tells the build to trace and include
  // those binary files for the specific routes that import them.
  outputFileTracingIncludes: {
    '/api/enhance-photo': [
      './node_modules/sharp/**/*',
      './node_modules/@img/**/*',
      './node_modules/onnxruntime-node/**/*',
    ],
    '/api/parse-resume': [
      './node_modules/sharp/**/*',
      './node_modules/@img/**/*',
      './node_modules/onnxruntime-node/**/*',
    ],
  },
};

export default nextConfig;
