import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  allowedDevOrigins: ["192.168.0.38"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    root: rootDirectory,
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
