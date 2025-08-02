/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/credenciales',
  output: 'standalone',
  trailingSlash: true, // (opcional pero ayuda con recursos estáticos)
};

module.exports = nextConfig;
