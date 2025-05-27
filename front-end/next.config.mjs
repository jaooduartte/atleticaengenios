/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pkfjmobhbnvlyvfxcptd.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/minha-conta', destination: '/my-account' },
      { source: '/admin/inicio', destination: '/admin/home' },
      { source: '/admin/financeiro', destination: '/admin/financial' },
      { source: '/admin/produtos', destination: '/admin/products' },
      { source: '/admin/eventos', destination: '/admin/events' },
      { source: '/admin/formularios', destination: '/admin/forms' },
      { source: '/admin/usuarios', destination: '/admin/users' },
      { source: '/inicio', destination: '/home' },
      { source: '/produtos', destination: '/products' },
      { source: '/eventos', destination: '/events' },
      { source: '/formularios', destination: '/forms' },
      { source: '/sobre', destination: '/about' },
    ];
  },
}

export default nextConfig;