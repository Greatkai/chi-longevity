/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    // Next 14：让 pg 作为服务端外部包，避免被打包进浏览器 bundle
    serverComponentsExternalPackages: ["pg"],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { pg: "commonjs pg" }];
    return config;
  },
};

export default nextConfig;
