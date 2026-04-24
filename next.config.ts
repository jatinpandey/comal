import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Ensure the polish spec travels with the serverless bundle.
  outputFileTracingIncludes: {
    "/api/transcribe": ["./prompts/**/*"],
  },
};

export default nextConfig;
