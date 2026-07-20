const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  allowedDevOrigins: ['192.168.1.102'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
