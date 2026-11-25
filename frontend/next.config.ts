// ตั้งค่า Next.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" = build ออกมาเป็นชุดเล็กที่รันได้เอง เหมาะกับ Docker
  output: "standalone",
};

export default nextConfig;
